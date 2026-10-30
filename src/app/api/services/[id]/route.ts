import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const serviceUpdateSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  category: z.enum([
    "ELECTRICIAN", "PLUMBER", "CARPENTER", "CLEANER", "MECHANIC", "REPAIR",
    "PAINTER", "WELDER", "MASON", "TAILOR", "HAIRDRESSER", "BEAUTICIAN",
    "TUTOR", "DRIVER", "DELIVERY", "CATERING", "EVENTS", "SECURITY", "GARDENING", "OTHER"
  ]).optional(),
  subcategory: z.string().optional().nullable(),
  description: z.string().min(20).max(5000).optional(),
  county: z.string().min(1).optional(),
  town: z.string().optional().nullable(),
  estate: z.string().optional().nullable(),
  contactPhone: z.string().min(10).optional(),
  contactEmail: z.string().email().optional().nullable(),
  whatsapp: z.boolean().optional(),
  areasServed: z.array(z.string()).optional(),
  pricing: z.string().optional().nullable(),
  businessHours: z.string().optional().nullable(),
  verificationStatus: z.enum(["PENDING", "VERIFIED", "REJECTED", "SUSPENDED"]).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const service = await prisma.serviceProvider.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, displayName: true, name: true, image: true, phone: true, email: true, createdAt: true },
        },
        location: { select: { county: true, town: true, estate: true } },
        _count: { select: { verifications: true } },
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Increment view count
    await prisma.serviceProvider.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("ServiceProvider GET error:", error);
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
    const validated = serviceUpdateSchema.parse(body);

    const service = await prisma.serviceProvider.findUnique({
      where: { id },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Check ownership or admin
    if (service.userId !== session.user.id && !["SUPER_ADMIN", "MODERATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const oldData = JSON.stringify(service);

    const updateData: any = { ...validated };
    if (validated.areasServed) {
      updateData.areasServed = JSON.stringify(validated.areasServed);
    }
    // Handle location updates
    if (validated.county || validated.town || validated.estate) {
      // Find or create location
      let location = null;
      if (validated.county) {
        location = await prisma.location.findFirst({
          where: {
            county: validated.county,
            town: validated.town || "",
            estate: validated.estate || "",
          },
        });
        if (!location) {
          location = await prisma.location.create({
            data: {
              county: validated.county,
              town: validated.town || "",
              estate: validated.estate || "",
            },
          });
        }
        updateData.locationId = location.id;
      }
    }
    delete updateData.county;
    delete updateData.town;
    delete updateData.estate;

    const updatedService = await prisma.serviceProvider.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, displayName: true, name: true, image: true } },
        location: { select: { county: true, town: true, estate: true } },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        entity: "ServiceProvider",
        entityId: id,
        oldData,
        newData: JSON.stringify(updatedService),
      },
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("ServiceProvider PUT error:", error);
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

    const service = await prisma.serviceProvider.findUnique({
      where: { id },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Check ownership or admin
    if (service.userId !== session.user.id && !["SUPER_ADMIN", "MODERATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.serviceProvider.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        entity: "ServiceProvider",
        entityId: id,
        oldData: JSON.stringify(service),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ServiceProvider DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}