import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const businessSettingsSchema = z.object({
  businessName: z.string().min(2).max(200),
  businessType: z.string().optional(),
  currency: z.string().default("KES"),
  taxRate: z.number().min(0).max(100).default(0),
  receiptPrefix: z.string().min(1).max(20).default("INV"),
  nextReceiptNum: z.number().int().positive().default(1),
  lowStockAlert: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let settings = await prisma.businessSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!settings) {
      // Create default settings
      settings = await prisma.businessSettings.create({
        data: {
          userId: session.user.id,
          businessName: session.user.displayName || session.user.name || "My Business",
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("BusinessSettings GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = businessSettingsSchema.parse(body);

    const settings = await prisma.businessSettings.upsert({
      where: { userId: session.user.id },
      update: validated,
      create: {
        userId: session.user.id,
        ...validated,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        entity: "BusinessSettings",
        entityId: settings.id,
        newData: JSON.stringify(settings),
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("BusinessSettings PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}