import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const reportUpdateSchema = z.object({
  status: z.enum(["PENDING", "UNDER_REVIEW", "RESOLVED", "DISMISSED", "ESCALATED"]).optional(),
  reviewedById: z.string().cuid().optional().nullable(),
  resolution: z.string().optional().nullable(),
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

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        reporter: { select: { id: true, displayName: true, name: true, image: true, email: true } },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check access
    const isReporter = report.reporterId === session.user.id;
    const isReviewedBy = report.reviewedBy === session.user.id;
    const isAdmin = ["SUPER_ADMIN", "MODERATOR", "VERIFICATION_OFFICER", "SUPPORT_STAFF"].includes(session.user.role);

    if (!isReporter && !isReviewedBy && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse evidence if it exists
    let evidence: any[] = [];
    if (report.evidence) {
      try {
        evidence = JSON.parse(report.evidence);
      } catch {
        evidence = [];
      }
    }

    return NextResponse.json({ ...report, evidence });
  } catch (error) {
    console.error("Report GET error:", error);
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
    const validated = reportUpdateSchema.parse(body);

    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check permissions - only reviewedBy staff or admins can update
    const isReviewedBy = report.reviewedBy === session.user.id;
    const isAdmin = ["SUPER_ADMIN", "MODERATOR", "VERIFICATION_OFFICER", "SUPPORT_STAFF"].includes(session.user.role);

    if (!isReviewedBy && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const oldData = JSON.stringify(report);

    const updateData: any = { ...validated };
    if (validated.status && validated.status !== report.status) {
      if (["RESOLVED", "DISMISSED"].includes(validated.status)) {
        updateData.reviewedAt = new Date();
      }
    }
    if (validated.reviewedById !== undefined) {
      updateData.reviewedBy = validated.reviewedById;
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: updateData,
      include: {
        reporter: { select: { id: true, displayName: true, name: true, image: true } },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: validated.status ? validated.status : "UPDATE",
        entity: "Report",
        entityId: id,
        oldData,
        newData: JSON.stringify(updatedReport),
      },
    });

    // Notify reporter of status change
    if (validated.status && validated.status !== report.status && report.reporterId) {
      await prisma.notification.create({
        data: {
          userId: report.reporterId,
          type: "REPORT_UPDATE",
          title: "Report Status Updated",
          message: `Your report has been ${validated.status.toLowerCase()}.`,
          data: JSON.stringify({ reportId: id, status: validated.status }),
        },
      });
    }

    return NextResponse.json(updatedReport);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("Report PUT error:", error);
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

    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Only reporter or admin can delete
    const isReporter = report.reporterId === session.user.id;
    const isAdmin = ["SUPER_ADMIN", "MODERATOR"].includes(session.user.role);

    if (!isReporter && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.report.delete({ where: { id } });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        entity: "Report",
        entityId: id,
        oldData: JSON.stringify(report),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Report DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}