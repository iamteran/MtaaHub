import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const propertyUpdateSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(20).max(5000).optional(),
  propertyType: z.enum(["BEDSITTER", "SINGLE_ROOM", "STUDIO", "APARTMENT", "HOUSE", "COMMERCIAL"]).optional(),
  county: z.string().min(1).optional(),
  town: z.string().min(1).optional(),
  estate: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  address: z.string().optional().nullable(),
  landmarks: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const property = await prisma.property.findUnique({
      where: { id, deletedAt: null },
      include: {
        media: { orderBy: { sortOrder: "asc" } },
        listings: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } },
        createdBy: { select: { id: true, displayName: true, name: true, image: true, phone: true, email: true, createdAt: true } },
        verifications: {
          include: { checker: { select: { id: true, displayName: true } } },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error("Property GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = propertyUpdateSchema.parse(body);

    const property = await prisma.property.findUnique({
      where: { id, deletedAt: null },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Check ownership or admin
    if (property.createdById !== session.user.id && !["SUPER_ADMIN", "MODERATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const oldData = JSON.stringify(property);

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: validated,
      include: {
        createdBy: { select: { id: true, displayName: true, name: true, image: true } },
        media: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        entity: "Property",
        entityId: id,
        oldData,
        newData: JSON.stringify(updatedProperty),
      },
    });

    return NextResponse.json(updatedProperty);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("Property PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const property = await prisma.property.findUnique({
      where: { id, deletedAt: null },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Check ownership or admin
    if (property.createdById !== session.user.id && !["SUPER_ADMIN", "MODERATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft delete
    await prisma.property.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        entity: "Property",
        entityId: id,
        oldData: JSON.stringify(property),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Property DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}