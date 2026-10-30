import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const verificationCreateSchema = z.object({
  type: z.enum(["CONTACT_VERIFIED", "AUTHORITY_VERIFIED", "PROPERTY_VERIFIED", "AVAILABILITY_VERIFIED"]),
  propertyId: z.string().cuid().optional(),
  serviceId: z.string().cuid().optional(),
  evidence: z.array(z.string().url()).optional(),
  notes: z.string().optional(),
}).refine((data) => data.propertyId || data.serviceId, {
  message: "Either propertyId or serviceId is required",
  path: ["propertyId"],
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const propertyId = searchParams.get("propertyId");
    const serviceId = searchParams.get("serviceId");

    const skip = (page - 1) * limit;

    const where: any = {};

    // Users can only see verifications they checked or for their properties/services unless admin
    if (!["SUPER_ADMIN", "MODERATOR", "VERIFICATION_OFFICER"].includes(session.user.role)) {
      where.OR = [
        { checkerId: session.user.id },
        { property: { createdById: session.user.id } },
        { service: { userId: session.user.id } },
      ];
    }

    if (status) where.status = status;
    if (type) where.type = type;
    if (propertyId) where.propertyId = propertyId;
    if (serviceId) where.serviceId = serviceId;

    const [verifications, total] = await Promise.all([
      prisma.verification.findMany({
        where,
        include: {
          checker: { select: { id: true, displayName: true, name: true, image: true } },
          property: { select: { id: true, title: true, county: true, town: true, createdById: true } },
          service: { select: { id: true, name: true, category: true, userId: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.verification.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: verifications,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("Verifications GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = verificationCreateSchema.parse(body);

    // Verify subject exists
    let subjectExists = false;
    if (validated.propertyId) {
      subjectExists = !!(await prisma.property.findUnique({ where: { id: validated.propertyId, deletedAt: null } }));
    } else if (validated.serviceId) {
      subjectExists = !!(await prisma.serviceProvider.findUnique({ where: { id: validated.serviceId } }));
    }

    if (!subjectExists) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Check for existing pending verification of same type
    const where: any = {
      type: validated.type,
      status: "PENDING",
    };
    if (validated.propertyId) where.propertyId = validated.propertyId;
    if (validated.serviceId) where.serviceId = validated.serviceId;

    const existing = await prisma.verification.findFirst({ where });

    if (existing) {
      return NextResponse.json({ error: "A pending verification of this type already exists for this subject" }, { status: 409 });
    }

    const verification = await prisma.verification.create({
      data: {
        ...validated,
        checkerId: session.user.id,
        evidence: validated.evidence ? JSON.stringify(validated.evidence) : "[]",
      },
      include: {
        checker: { select: { id: true, displayName: true, name: true, image: true } },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entity: "Verification",
        entityId: verification.id,
        newData: JSON.stringify(verification),
      },
    });

    // Notify verification officers
    const officers = await prisma.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "VERIFICATION_OFFICER"] } },
      select: { id: true },
    });

    await prisma.notification.createMany({
      data: officers.map((officer) => ({
        userId: officer.id,
        type: "VERIFICATION_UPDATE",
        title: "New Verification Request",
        message: `A new ${validated.type.toLowerCase().replace("_", " ")} request has been submitted.`,
        data: JSON.stringify({ verificationId: verification.id, type: validated.type }),
      })),
    });

    return NextResponse.json(verification, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("Verification POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}