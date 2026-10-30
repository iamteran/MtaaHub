import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const notificationUpdateSchema = z.object({
  read: z.boolean(),
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
    const read = searchParams.get("read");
    const type = searchParams.get("type");

    const skip = (page - 1) * limit;

    const where: any = { userId: session.user.id };
    if (read !== null) where.read = read === "true";
    if (type) where.type = type;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, read: false },
    });

    return NextResponse.json({
      data: notifications,
      total,
      page,
      limit,
      totalPages,
      unreadCount,
    });
  } catch (error) {
    console.error("Notifications GET error:", error);
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
    const { ids, read } = body;

    if (!Array.isArray(ids) || typeof read !== "boolean") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    await prisma.notification.updateMany({
      where: { id: { in: ids }, userId: session.user.id },
      data: { read },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notifications PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}