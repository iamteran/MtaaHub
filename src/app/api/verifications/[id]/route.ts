import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const verificationUpdateSchema = z.object({
  status: z.enum(["PENDING", "VERIFIED", "REJECTED", "EXPIRED"]),
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

    const verification = await prisma.verification.findUnique({
      where: { id },
      include: {
        checker: { select: { id: true, displayName: true, name: true, image: true, email: true } },
        property: { include: { createdBy: { select: { id: true, displayName: true } } } },
        service: { include: { user: { select: { id: true, displayName: true } } } },
      },
    });

    if (!verification) {
      return NextResponse.json({ error: "Verification not found" }, { status: 404 });
    }

    // Check access
    const isChecker = verification.checkerId === session.user.id;
    const isAdmin = ["SUPER_ADMIN", "MODERATOR", "VERIFICATION_OFFICER"].includes(session.user.role);

    // Also check if user owns the property/service being verified
    let isOwner = false;
    if (verification.property) {
      isOwner = verification.property.createdById === session.user.id;
    } else if (verification.service) {
      isOwner = verification.service.userId === session.user.id;
    }

    if (!isChecker && !isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse evidence if it exists
    let evidence: any[] = [];
    if (verification.evidence) {
      try {
        evidence = JSON.parse(verification.evidence);
      } catch {
        evidence = [];
      }
    }

    return NextResponse.json(verification);
  } catch (error) {
    console.error("Verification GET error:", error);
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

    // Only verification officers and admins can review
    if (!["SUPER_ADMIN", "VERIFICATION_OFFICER", "MODERATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Only verification officers can review verifications" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = verificationUpdateSchema.parse(body);

    const verification = await prisma.verification.findUnique({
      where: { id },
      include: {
        property: true,
        service: true,
      },
    });

    if (!verification) {
      return NextResponse.json({ error: "Verification not found" }, { status: 404 });
    }

    const oldData = JSON.stringify(verification);

    const updateData: any = {
      ...validated,
      checkerId: session.user.id,
    };

    const updatedVerification = await prisma.verification.update({
      where: { id },
      data: updateData,
      include: {
        checker: { select: { id: true, displayName: true, name: true, image: true } },
        property: { include: { createdBy: { select: { id: true, displayName: true } } } },
        service: { include: { user: { select: { id: true, displayName: true } } } },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: validated.status === "VERIFIED" ? "VERIFY" : validated.status === "REJECTED" ? "UNVERIFY" : "UPDATE",
        entity: "Verification",
        entityId: id,
        oldData,
        newData: JSON.stringify(updatedVerification),
      },
    });

    // Notify property/service owner
    let ownerId: string | null = null;
    if (updatedVerification.property) {
      ownerId = updatedVerification.property.createdById;
    } else if (updatedVerification.service) {
      ownerId = updatedVerification.service.userId;
    }

    if (ownerId) {
      await prisma.notification.create({
        data: {
          userId: ownerId,
          type: "VERIFICATION_UPDATE",
          title: "Verification Status Updated",
          message: `Your ${verification.type.toLowerCase().replace("_", " ")} request has been ${validated.status.toLowerCase()}.`,
          data: JSON.stringify({ verificationId: id, status: validated.status }),
        },
      });
    }

    return NextResponse.json(updatedVerification);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("Verification PUT error:", error);
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

    const verification = await prisma.verification.findUnique({
      where: { id },
    });

    if (!verification) {
      return NextResponse.json({ error: "Verification not found" }, { status: 404 });
    }

    // Only checker or admin can delete
    const isChecker = verification.checkerId === session.user.id;
    const isAdmin = ["SUPER_ADMIN", "MODERATOR"].includes(session.user.role);

    if (!isChecker && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.verification.delete({ where: { id } });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        entity: "Verification",
        entityId: id,
        oldData: JSON.stringify(verification),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verification DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}