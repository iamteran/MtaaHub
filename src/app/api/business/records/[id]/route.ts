import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const businessRecordUpdateSchema = z.object({
  type: z.enum(["SALE", "EXPENSE", "STOCK_IN", "STOCK_OUT", "ADJUSTMENT"]).optional(),
  category: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  amount: z.number().int().optional(),
  quantity: z.number().optional().nullable(),
  unit: z.string().optional().nullable(),
  date: z.string().datetime().optional(),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const record = await prisma.biasharaRecord.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error("BusinessRecord GET error:", error);
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
    const validated = businessRecordUpdateSchema.parse(body);

    const record = await prisma.biasharaRecord.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const oldData = JSON.stringify(record);

    const updateData: any = { ...validated };
    if (validated.date) updateData.date = new Date(validated.date);

    const updatedRecord = await prisma.biasharaRecord.update({
      where: { id },
      data: updateData,
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        entity: "BusinessRecord",
        entityId: id,
        oldData,
        newData: JSON.stringify(updatedRecord),
      },
    });

    return NextResponse.json(updatedRecord);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("BusinessRecord PUT error:", error);
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

    const record = await prisma.biasharaRecord.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    await prisma.biasharaRecord.delete({ where: { id } });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        entity: "BusinessRecord",
        entityId: id,
        oldData: JSON.stringify(record),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("BusinessRecord DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}