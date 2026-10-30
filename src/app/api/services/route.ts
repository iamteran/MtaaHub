import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const serviceCreateSchema = z.object({
  name: z.string().min(2).max(200),
  category: z.enum([
    "ELECTRICIAN", "PLUMBER", "CARPENTER", "CLEANER", "MECHANIC", "REPAIR",
    "PAINTER", "WELDER", "MASON", "TAILOR", "HAIRDRESSER", "BEAUTICIAN",
    "TUTOR", "DRIVER", "DELIVERY", "CATERING", "EVENTS", "SECURITY", "GARDENING", "OTHER"
  ]),
  subcategory: z.string().optional(),
  description: z.string().min(20).max(5000),
  county: z.string().min(1),
  town: z.string().optional(),
  estate: z.string().optional(),
  contactPhone: z.string().min(10),
  contactEmail: z.string().email().optional(),
  whatsapp: z.boolean().default(true),
  areasServed: z.array(z.string()).optional(),
  pricing: z.string().optional(),
  businessHours: z.string().optional(),
});

const serviceUpdateSchema = serviceCreateSchema.partial().extend({
  verificationStatus: z.enum(["PENDING", "VERIFIED", "REJECTED", "SUSPENDED"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const status = searchParams.get("status") || "ACTIVE";
    const category = searchParams.get("category");
    const county = searchParams.get("county");
    const town = searchParams.get("town");
    const estate = searchParams.get("estate");
    const userId = searchParams.get("userId");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "newest";

    const skip = (page - 1) * limit;

    const where: any = {
      verificationStatus: status === "all" ? undefined : status,
    };

    if (category) where.category = category;
    if (userId) where.userId = userId;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { subcategory: { contains: search } },
      ];
    }

    // Location filters via location relation
    if (county || town || estate) {
      where.location = {};
      if (county) where.location.county = county;
      if (town) where.location.town = town;
      if (estate) where.location.estate = estate;
    }

    const orderBy: any = {};
    switch (sortBy) {
      case "oldest":
        orderBy.createdAt = "asc";
        break;
      case "rating_desc":
        orderBy.rating = "desc";
        break;
      case "newest":
      default:
        orderBy.createdAt = "desc";
        break;
    }

    const [services, total] = await Promise.all([
      prisma.serviceProvider.findMany({
        where,
        include: {
          user: { select: { id: true, displayName: true, name: true, image: true, createdAt: true } },
          location: { select: { county: true, town: true, estate: true } },
          _count: { select: { verifications: true } },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.serviceProvider.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: services,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("Services GET error:", error);
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
    const validated = serviceCreateSchema.parse(body);

    // Check if user already has a service provider profile
    const existingProfile = await prisma.serviceProvider.findFirst({
      where: { userId: session.user.id },
    });

    if (existingProfile) {
      return NextResponse.json({ error: "You already have a service profile. Use PUT to update it." }, { status: 409 });
    }

    const createData: any = { ...validated, userId: session.user.id };
    if (validated.areasServed) {
      createData.areasServed = JSON.stringify(validated.areasServed);
    }

    const service = await prisma.serviceProvider.create({
      data: createData,
      include: {
        user: { select: { id: true, displayName: true, name: true, image: true } },
        location: { select: { county: true, town: true, estate: true } },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entity: "ServiceProvider",
        entityId: service.id,
        newData: JSON.stringify(service),
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("ServiceProvider POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}