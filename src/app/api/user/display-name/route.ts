import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { displayName } = body;

    if (!displayName || typeof displayName !== "string") {
      return NextResponse.json({ error: "Display name is required" }, { status: 400 });
    }

    const trimmed = displayName.trim();
    if (trimmed.length < 2) {
      return NextResponse.json({ error: "Display name must be at least 2 characters" }, { status: 400 });
    }
    if (trimmed.length > 50) {
      return NextResponse.json({ error: "Display name must be less than 50 characters" }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9\s\-_.']+$/.test(trimmed)) {
      return NextResponse.json({ error: "Display name contains invalid characters" }, { status: 400 });
    }

    // Check if display name is already taken
    const existing = await prisma.user.findFirst({
      where: { displayName: trimmed },
    });

    if (existing && existing.id !== session.user.id) {
      return NextResponse.json({ error: "Display name already taken" }, { status: 409 });
    }

    // Update display name
    await prisma.user.update({
      where: { id: session.user.id },
      data: { displayName: trimmed },
    });

    return NextResponse.json({ success: true, displayName: trimmed });
  } catch (error) {
    console.error("Display name update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
