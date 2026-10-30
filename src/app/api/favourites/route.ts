import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const favouriteCreateSchema = z.object({
  listingId: z.string().cuid(),
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

    const skip = (page - 1) * limit;

    const [favourites, total] = await Promise.all([
      prisma.favourite.findMany({
        where: { userId: session.user.id },
        include: {
          listing: {
            include: {
              user: { select: { id: true, displayName: true, name: true, image: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.favourite.count({ where: { userId: session.user.id } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: favourites,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("Favourites GET error:", error);
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
    const validated = favouriteCreateSchema.parse(body);

    // Check if listing exists and is active
    const listing = await prisma.listing.findUnique({
      where: { id: validated.listingId },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Check if already favourited
    const existing = await prisma.favourite.findUnique({
      where: {
        userId_listingId: {
          userId: session.user.id,
          listingId: validated.listingId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Already in favourites" }, { status: 409 });
    }

    const favourite = await prisma.favourite.create({
      data: {
        userId: session.user.id,
        listingId: validated.listingId,
      },
      include: {
        listing: {
          include: {
            user: { select: { id: true, displayName: true, name: true, image: true } },
          },
        },
      },
    });

    // Increment favourite count
    await prisma.listing.update({
      where: { id: validated.listingId },
      data: { favouriteCount: { increment: 1 } },
    });

    return NextResponse.json(favourite, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("Favourite POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}