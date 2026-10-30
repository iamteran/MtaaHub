import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const priceUpdateSchema = z.object({
  category: z.string().min(2).max(60).optional(),
  itemName: z.string().min(2).max(200).optional(),
  brand: z.string().max(120).optional().nullable(),
  unit: z.string().min(1).max(60).optional(),
  price: z.number().int().positive().optional(),
  county: z.string().min(2).max(60).optional(),
  town: z.string().max(120).optional().nullable(),
  estate: z.string().max(120).optional().nullable(),
  source: z.string().max(60).optional(),
  notes: z.string().max(1000).optional().nullable(),
  isVerified: z.boolean().optional(),
});

const STAFF = ["SUPER_ADMIN", "MODERATOR", "VERIFICATION_OFFICER", "SUPPORT_STAFF"];

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const price = await prisma.priceSubmission.findUnique({
      where: { id: params.id },
      include: {
        submittedBy: { select: { id: true, displayName: true, name: true, image: true } },
        verifiedBy: { select: { id: true, displayName: true, name: true } },
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.priceSubmission.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Price not found" }, { status: 404 });
    }

    const isStaff = STAFF.includes(session.user.role ?? "");
    if (existing.submittedById !== session.user.id && !isStaff) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const validated = priceUpdateSchema.parse(await request.json());

    const price = await prisma.priceSubmission.update({
      where: { id: params.id },
      data: {
        ...validated,
        ...(validated.isVerified !== undefined
          ? { verifiedAt: validated.isVerified ? new Date() : null, verifiedById: validated.isVerified ? session.user.id : null }
          : {}),
      },
      include: {
        submittedBy: { select: { id: true, displayName: true, name: true, image: true } },
      },
    });

    return NextResponse.json(price);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("Price PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.priceSubmission.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Price not found" }, { status: 404 });
    }

    const isStaff = STAFF.includes(session.user.role ?? "");
    if (existing.submittedById !== session.user.id && !isStaff) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.priceSubmission.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Price DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
