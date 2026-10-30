import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const propertyCreateSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  propertyType: z.enum(["BEDSITTER", "SINGLE_ROOM", "STUDIO", "APARTMENT", "HOUSE", "COMMERCIAL"]),
  county: z.string().min(1),
  town: z.string().min(1),
  estate: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  address: z.string().optional().nullable(),
  landmarks: z.string().optional().nullable(),
  media: z.array(z.object({
    url: z.string().url(),
    type: z.enum(["image", "video"]).default("image"),
    isPrimary: z.boolean().default(false),
  })).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const propertyType = searchParams.get("propertyType");
    const county = searchParams.get("county");
    const town = searchParams.get("town");
    const estate = searchParams.get("estate");
    const createdById = searchParams.get("createdById");
    const sortBy = searchParams.get("sortBy") || "newest";

    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (propertyType) where.propertyType = propertyType;
    if (county) where.county = county;
    if (town) where.town = town;
    if (estate) where.estate = estate;
    if (createdById) where.createdById = createdById;

    const orderBy: any = {};
    switch (sortBy) {
      case "oldest":
        orderBy.createdAt = "asc";
        break;
      case "newest":
      default:
        orderBy.createdAt = "desc";
        break;
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          media: { where: { isPrimary: true }, take: 1 },
          createdBy: { select: { id: true, displayName: true, name: true, image: true, createdAt: true } },
          _count: { select: { listings: true } },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.property.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: properties,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("Properties GET error:", error);
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
    const validated = propertyCreateSchema.parse(body);

    const { media, ...propertyData } = validated;

    const property = await prisma.property.create({
      data: {
        ...propertyData,
        createdById: session.user.id,
        media: media && media.length > 0 ? {
          create: media.map((m, i) => ({
            url: m.url,
            type: m.type,
            sortOrder: i,
            isPrimary: m.isPrimary && i === 0,
          })),
        } : undefined,
      },
      include: {
        createdBy: { select: { id: true, displayName: true, name: true, image: true } },
        media: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entity: "Property",
        entityId: property.id,
        newData: JSON.stringify(property),
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("Property POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}