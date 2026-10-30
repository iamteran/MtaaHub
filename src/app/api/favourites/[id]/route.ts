import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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

    const favourite = await prisma.favourite.findUnique({
      where: { id },
    });

    if (!favourite) {
      return NextResponse.json({ error: "Favourite not found" }, { status: 404 });
    }

    // Check ownership
    if (favourite.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const listingId = favourite.listingId;

    await prisma.favourite.delete({ where: { id } });

    // Decrement favourite count
    await prisma.listing.update({
      where: { id: listingId },
      data: { favouriteCount: { decrement: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Favourite DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}