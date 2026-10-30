import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const priceCreateSchema = z.object({
  category: z.string().min(2).max(60),
  itemName: z.string().min(2).max(200),
  brand: z.string().max(120).optional().nullable(),
  unit: z.string().min(1).max(60),
  price: z.number().int().positive(),
  county: z.string().min(2).max(60),
  town: z.string().max(120).optional().nullable(),
  estate: z.string().max(120).optional().nullable(),
  source: z.string().max(60).default("Shop"),
  notes: z.string().max(1000).optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const category = searchParams.get("category");
    const itemName = searchParams.get("itemName");
    const county = searchParams.get("county");
    const town = searchParams.get("town");
    const submittedById = searchParams.get("submittedById");
    const sortBy = searchParams.get("sortBy") || "newest";

    const where: Record<string, unknown> = { status: "ACTIVE" };
    if (category) where.category = category;
    if (itemName) where.itemName = { contains: itemName };
    if (county) where.county = county;
    if (town) where.town = town;
    if (submittedById) where.submittedById = submittedById;

    const orderBy =
      sortBy === "oldest"
        ? { submittedAt: "asc" as const }
        : sortBy === "price_asc"
          ? { price: "asc" as const }
          : sortBy === "price_desc"
            ? { price: "desc" as const }
            : { submittedAt: "desc" as const };

    const [prices, total] = await Promise.all([
      prisma.priceSubmission.findMany({
        where,
        include: {
          submittedBy: { select: { id: true, displayName: true, name: true, image: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      prisma.priceSubmission.count({ where }),
    ]);

    return NextResponse.json({
      data: prices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
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

    const price = await prisma.priceSubmission.create({
      data: {
        submittedById: session.user.id,
        category: validated.category,
        itemName: validated.itemName,
        brand: validated.brand ?? null,
        unit: validated.unit,
        price: validated.price,
        county: validated.county,
        town: validated.town ?? null,
        estate: validated.estate ?? null,
        source: validated.source,
        notes: validated.notes ?? null,
        status: "ACTIVE",
      },
      include: {
        submittedBy: { select: { id: true, displayName: true, name: true, image: true } },
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
