import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const listingUpdateSchema = z.object({
  monthlyRent: z.number().int().positive().optional(),
  deposit: z.number().int().nonnegative().optional(),
  otherFees: z.number().int().nonnegative().optional(),
  feesDescription: z.string().optional(),
  bedrooms: z.number().int().positive().optional(),
  bathrooms: z.number().int().positive().optional(),
  availableFrom: z.string().datetime().optional(),
  availableUntil: z.string().datetime().optional().nullable(),
  availabilityStatus: z.enum(["AVAILABLE", "SOON", "RENTED", "UNAVAILABLE"]).optional(),
  status: z.enum(["DRAFT", "PENDING_REVIEW", "ACTIVE", "EXPIRED", "WITHDRAWN", "RENTED", "SUSPENDED", "STALE"]).optional(),
  contactPhone: z.string().min(10).optional(),
  contactEmail: z.string().email().optional().nullable(),
  contactPreference: z.enum(["phone", "email", "both"]).optional(),
  lastConfirmedAt: z.string().datetime().optional().nullable(),
  amenities: z.array(z.string()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, displayName: true, name: true, image: true, phone: true, email: true, createdAt: true },
        },
        verifications: {
          include: { checker: { select: { id: true, displayName: true } } },
        },
        favourites: { select: { userId: true } },
        _count: { select: { favourites: true } },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Increment view count
    await prisma.listing.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Listing GET error:", error);
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
    const validated = listingUpdateSchema.parse(body);

    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Check ownership or admin
    if (listing.userId !== session.user.id && !["SUPER_ADMIN", "MODERATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Capture old data for audit
    const oldData = JSON.stringify(listing);

    // Prepare update data
    const updateData: any = { ...validated };
    if (validated.availableFrom) updateData.availableFrom = new Date(validated.availableFrom);
    if (validated.availableUntil !== undefined) {
      updateData.availableUntil = validated.availableUntil ? new Date(validated.availableUntil) : null;
    }

    // Handle amenities update - amenities is a JSON string field
    if (validated.amenities) {
      updateData.amenities = JSON.stringify(validated.amenities);
    }

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, displayName: true, name: true, image: true } },
        location: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        entity: "Listing",
        entityId: id,
        oldData,
        newData: JSON.stringify(updatedListing),
      },
    });

    return NextResponse.json(updatedListing);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("Listing PUT error:", error);
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

    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Check ownership or admin
    if (listing.userId !== session.user.id && !["SUPER_ADMIN", "MODERATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft delete - just update status
    await prisma.listing.update({
      where: { id },
      data: { status: "WITHDRAWN" },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        entity: "Listing",
        entityId: id,
        oldData: JSON.stringify(listing),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Listing DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}