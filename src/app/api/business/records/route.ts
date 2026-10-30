import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const businessRecordCreateSchema = z.object({
  type: z.enum(["SALE", "EXPENSE", "STOCK_IN", "STOCK_OUT", "ADJUSTMENT"]),
  category: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  amount: z.number().int(), // Can be negative for expenses
  quantity: z.number().optional(),
  unit: z.string().optional(),
  date: z.string().datetime(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

const businessRecordUpdateSchema = businessRecordCreateSchema.partial();

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const sortBy = searchParams.get("sortBy") || "date_desc";

    const skip = (page - 1) * limit;

    const where: any = { userId: session.user.id };

    if (type) where.type = type;
    if (category) where.category = category;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const orderBy: any = {};
    switch (sortBy) {
      case "date_asc":
        orderBy.date = "asc";
        break;
      case "amount_asc":
        orderBy.amount = "asc";
        break;
      case "amount_desc":
        orderBy.amount = "desc";
        break;
      case "date_desc":
      default:
        orderBy.date = "desc";
        break;
    }

    const [records, total] = await Promise.all([
      prisma.biasharaRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.biasharaRecord.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Calculate summary
    const summary = await prisma.biasharaRecord.groupBy({
      by: ["type"],
      where,
      _sum: { amount: true },
      _count: true,
    });

    return NextResponse.json({
      data: records,
      total,
      page,
      limit,
      totalPages,
      summary,
    });
  } catch (error) {
    console.error("BusinessRecords GET error:", error);
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
    const validated = businessRecordCreateSchema.parse(body);

    const record = await prisma.biasharaRecord.create({
      data: {
        ...validated,
        userId: session.user.id,
        date: new Date(validated.date),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entity: "BusinessRecord",
        entityId: record.id,
        newData: JSON.stringify(record),
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("BusinessRecord POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}