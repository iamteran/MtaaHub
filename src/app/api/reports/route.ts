import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const reportCreateSchema = z.object({
  type: z.enum(["SCAM", "FRAUDULENT_LISTING", "INAPPROPRIATE_CONTENT", "SPAM", "IMPERSONATION", "MISLEADING_INFO", "OTHER"]),
  targetType: z.enum(["LISTING", "JOB_POST", "SERVICE_PROVIDER", "PRICE_SUBMISSION", "PROPERTY", "USER"]),
  targetId: z.string().cuid(),
  reason: z.string().min(20).max(5000),
  evidence: z.array(z.string().url()).optional(),
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
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const reporterId = searchParams.get("reporterId");

    const skip = (page - 1) * limit;

    const where: any = {};

    // Users can only see their own reports unless they're admin/moderator
    if (!["SUPER_ADMIN", "MODERATOR", "VERIFICATION_OFFICER", "SUPPORT_STAFF"].includes(session.user.role)) {
      where.reporterId = session.user.id;
    } else {
      if (reporterId) where.reporterId = reporterId;
    }

    if (status) where.status = status;
    if (type) where.type = type;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: { select: { id: true, displayName: true, name: true, image: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.report.count({ where }),
    ]);

    // Parse evidence for each report
    const reportsWithEvidence = reports.map((report) => {
      let evidence: any[] = [];
      if (report.evidence) {
        try {
          evidence = JSON.parse(report.evidence);
        } catch {
          evidence = [];
        }
      }
      return { ...report, evidence };
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: reportsWithEvidence,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("Reports GET error:", error);
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
    const validated = reportCreateSchema.parse(body);

    // Verify target exists
    let targetExists = false;
    switch (validated.targetType) {
      case "LISTING":
        targetExists = !!(await prisma.listing.findUnique({ where: { id: validated.targetId } }));
        break;
      case "JOB_POST":
        targetExists = !!(await prisma.jobPost.findUnique({ where: { id: validated.targetId } }));
        break;
      case "SERVICE_PROVIDER":
        targetExists = !!(await prisma.serviceProvider.findUnique({ where: { id: validated.targetId } }));
        break;
      case "PRICE_SUBMISSION":
        targetExists = !!(await prisma.priceSubmission.findUnique({ where: { id: validated.targetId } }));
        break;
      case "PROPERTY":
        targetExists = !!(await prisma.property.findUnique({ where: { id: validated.targetId, deletedAt: null } }));
        break;
      case "USER":
        targetExists = !!(await prisma.user.findUnique({ where: { id: validated.targetId } }));
        break;
    }

    if (!targetExists) {
      return NextResponse.json({ error: "Target not found" }, { status: 404 });
    }

    const report = await prisma.report.create({
      data: {
        ...validated,
        reporterId: session.user.id,
        evidence: validated.evidence ? JSON.stringify(validated.evidence) : "[]",
      },
      include: {
        reporter: { select: { id: true, displayName: true, name: true, image: true } },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entity: "Report",
        entityId: report.id,
        newData: JSON.stringify(report),
      },
    });

    // Create notification for admins
    const admins = await prisma.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "MODERATOR", "SUPPORT_STAFF"] } },
      select: { id: true },
    });

    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        type: "REPORT_UPDATE",
        title: "New Report Submitted",
        message: `A new ${validated.type.toLowerCase().replace("_", " ")} report has been submitted.`,
        data: JSON.stringify({ reportId: report.id, type: validated.type }),
      })),
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("Report POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}