import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const priceCreateSchema = z.object({
  category: z.enum([
    "FOOD", "TRANSPORT", "HOUSING", "UTILITIES", "SERVICES", "EDUCATION",
    "HEALTHCARE", "PERSONAL_CARE", "ELECTRONICS", "CLOTHING",
    "BUILDING_MATERIALS", "AGRICULTURE", "OTHER"
  ]),
  itemName: z.string().min(2).max(200),
  brand: z.string().optional(),
  unit: z.string().min(1).max(50),
  price: z.number().int().positive(),
  locationId: z.string().cuid().optional().nullable(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const category = searchParams.get("category");
    const itemName = searchParams.get("itemName");
    const county = searchParams.get("county");
    const town = searchParams.get("town");
    const submittedById = searchParams.get("submittedById");
    const sortBy = searchParams.get("sortBy") || "newest";

    const skip = (page - 1) * limit;

    const where: any = {};

    if (category) where.category = category;
    if (itemName) where.itemName = { contains: itemName };
    if (submittedById) where.userId = submittedById;

    // Location filters via location relation
    if (county || town) {
      where.location = {};
      if (county) where.location.county = county;
      if (town) where.location.town = town;
    }

    const orderBy: any = {};
    switch (sortBy) {
      case "oldest":
        orderBy.submittedAt = "asc";
        break;
      case "price_asc":
        orderBy.price = "asc";
        break;
      case "price_desc":
        orderBy.price = "desc";
        break;
      case "newest":
      default:
        orderBy.submittedAt = "desc";
        break;
    }

    const [prices, total] = await Promise.all([
      prisma.price.findMany({
        where,
        include: {
          user: { select: { id: true, displayName: true, name: true, image: true } },
          location: { select: { county: true, town: true, estate: true } },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.price.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: prices,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("Prices GET error:", error);
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
    const validated = priceCreateSchema.parse(body);

    const price = await prisma.price.create({
      data: {
        ...validated,
        userId: session.user.id,
      },
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
        entity: "Price",
        entityId: price.id,
        newData: JSON.stringify(price),
      },
    });

    return NextResponse.json(price, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("Price POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}