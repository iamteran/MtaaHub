import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const listingCreateSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(10000),
  propertyType: z.string().min(1).max(50),
  bedrooms: z.number().int().positive().optional(),
  bathrooms: z.number().int().positive().optional(),
  rent: z.number().int().positive(),
  deposit: z.number().int().nonnegative().optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
  availableFrom: z.string().datetime().optional(),
  availableUntil: z.string().datetime().optional().nullable(),
  contactPhone: z.string().min(10),
  contactWhatsApp: z.boolean().default(true),
  contactEmail: z.boolean().default(false),
  locationId: z.string().cuid().optional(),
});

const listingUpdateSchema = listingCreateSchema.partial().extend({
  status: z.enum(["DRAFT", "PENDING_REVIEW", "ACTIVE", "EXPIRED", "WITHDRAWN", "RENTED", "SUSPENDED", "STALE"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const status = searchParams.get("status") || "ACTIVE";
    const county = searchParams.get("county");
    const town = searchParams.get("town");
    const estate = searchParams.get("estate");
    const propertyType = searchParams.get("propertyType");
    const minRent = searchParams.get("minRent") ? parseInt(searchParams.get("minRent")!) : undefined;
    const maxRent = searchParams.get("maxRent") ? parseInt(searchParams.get("maxRent")!) : undefined;
    const bedrooms = searchParams.get("bedrooms") ? parseInt(searchParams.get("bedrooms")!) : undefined;
    const amenities = searchParams.get("amenities")?.split(",").filter(Boolean);
    const sortBy = searchParams.get("sortBy") || "newest";
    const ownerId = searchParams.get("ownerId");

    const skip = (page - 1) * limit;

    const where: any = {
      status: status === "all" ? undefined : status,
    };

    if (ownerId) {
      where.userId = ownerId;
    }

    // Location filters (via location relation)
    if (county || town || estate) {
      where.location = {};
      if (county) where.location.county = county;
      if (town) where.location.town = town;
      if (estate) where.location.estate = estate;
    }

    if (propertyType) where.propertyType = propertyType;
    if (minRent !== undefined) where.rent = { ...where.rent, gte: minRent };
    if (maxRent !== undefined) where.rent = { ...where.rent, lte: maxRent };
    if (bedrooms !== undefined) where.bedrooms = bedrooms;

    if (amenities && amenities.length > 0) {
      // amenities is a JSON string, we need to search within it
      where.amenities = {
        contains: amenities[0], // Simplified - just check first amenity
      };
    }

    const orderBy: any = {};
    switch (sortBy) {
      case "oldest":
        orderBy.createdAt = "asc";
        break;
      case "price_asc":
        orderBy.rent = "asc";
        break;
      case "price_desc":
        orderBy.rent = "desc";
        break;
      case "newest":
      default:
        orderBy.createdAt = "desc";
        break;
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          user: {
            select: { id: true, displayName: true, name: true, image: true, createdAt: true },
          },
          location: {
            select: { county: true, town: true, estate: true },
          },
          verifications: {
            where: { status: "VERIFIED" },
            select: { type: true, status: true, createdAt: true },
          },
          favourites: { select: { userId: true } },
          _count: { select: { favourites: true } },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.listing.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: listings,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("Listings GET error:", error);
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
    const validated = listingCreateSchema.parse(body);

    // Handle amenities - convert array to JSON string
    const createData: any = { ...validated, userId: session.user.id };
    if (validated.amenities) {
      createData.amenities = JSON.stringify(validated.amenities);
    }
    if (validated.images) {
      createData.images = JSON.stringify(validated.images);
    }
    if (validated.availableFrom) {
      createData.availableFrom = new Date(validated.availableFrom);
    }
    if (validated.availableUntil) {
      createData.availableUntil = new Date(validated.availableUntil);
    }

    const listing = await prisma.listing.create({
      data: createData,
      include: {
        user: { select: { id: true, displayName: true, name: true, image: true, createdAt: true } },
        location: { select: { county: true, town: true, estate: true } },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entity: "Listing",
        entityId: listing.id,
        newData: JSON.stringify(listing),
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("Listing POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}