import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const priceUpdateSchema = z.object({
  category: z.enum([
    "FOOD", "TRANSPORT", "HOUSING", "UTILITIES", "SERVICES", "EDUCATION",
    "HEALTHCARE", "PERSONAL_CARE", "ELECTRONICS", "CLOTHING",
    "BUILDING_MATERIALS", "AGRICULTURE", "OTHER"
  ]).optional(),
  itemName: z.string().min(2).max(200).optional(),
  brand: z.string().optional().nullable(),
  unit: z.string().min(1).max(50).optional(),
  price: z.number().int().positive().optional(),
  locationId: z.string().cuid().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const price = await prisma.price.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, displayName: true, name: true, image: true, createdAt: true } },
        location: { select: { county: true, town: true, estate: true } },
      },
    });

    if (!price) {
      return NextResponse.json({ error: "Price not found" }, { status: 404 });
    }

    return NextResponse.json(price);
  } catch (error) {
    console.error("Price GET error:", error);
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
    const validated = priceUpdateSchema.parse(body);

    const price = await prisma.price.findUnique({
      where: { id },
    });

    if (!price) {
      return NextResponse.json({ error: "Price not found" }, { status: 404 });
    }

    // Check ownership or admin
    const isOwner = price.userId === session.user.id;
    const isAdmin = ["SUPER_ADMIN", "MODERATOR", "VERIFICATION_OFFICER"].includes(session.user.role);

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const oldData = JSON.stringify(price);

    const updateData: any = { ...validated };
    if (validated.locationId !== undefined) {
      updateData.locationId = validated.locationId;
    }

    const updatedPrice = await prisma.price.update({
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
        entity: "Price",
        entityId: id,
        oldData,
        newData: JSON.stringify(updatedPrice),
      },
    });

    return NextResponse.json(updatedPrice);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("Price PUT error:", error);
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

    const price = await prisma.price.findUnique({
      where: { id },
    });

    if (!price) {
      return NextResponse.json({ error: "Price not found" }, { status: 404 });
    }

    // Check ownership or admin
    if (price.userId !== session.user.id && !["SUPER_ADMIN", "MODERATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.price.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        entity: "Price",
        entityId: id,
        oldData: JSON.stringify(price),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Price DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}