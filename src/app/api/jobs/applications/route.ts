import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const jobApplicationCreateSchema = z.object({
  jobPostId: z.string().cuid(),
  coverLetter: z.string().max(5000).optional(),
  resumeUrl: z.string().url().optional().or(z.literal("")),
});

const jobApplicationUpdateSchema = z.object({
  status: z.enum(["APPLIED", "REVIEWING", "SHORTLISTED", "INTERVIEW", "OFFERED", "REJECTED", "WITHDRAWN"]).optional(),
  coverLetter: z.string().max(5000).optional().nullable(),
  resumeUrl: z.string().url().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const status = searchParams.get("status");
    const applicantId = searchParams.get("applicantId");
    const jobPostId = searchParams.get("jobPostId");
    const sortBy = searchParams.get("sortBy") || "newest";

    const skip = (page - 1) * limit;

    const where: any = {};

    // Users can only see their own applications unless they're the job poster
    if (!["SUPER_ADMIN", "MODERATOR"].includes(session.user.role)) {
      where.applicantId = session.user.id;
    } else if (applicantId) {
      where.applicantId = applicantId;
    }

    if (status) where.status = status;
    if (jobPostId) where.jobPostId = jobPostId;

    const orderBy: any = {};
    switch (sortBy) {
      case "oldest":
        orderBy.appliedAt = "asc";
        break;
      case "newest":
      default:
        orderBy.appliedAt = "desc";
        break;
    }

    const [applications, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        include: {
          jobPost: {
            include: {
              postedBy: { select: { id: true, displayName: true, name: true, image: true } },
            },
          },
          applicant: { select: { id: true, displayName: true, name: true, image: true, email: true } },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.jobApplication.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: applications,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("JobApplications GET error:", error);
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
    const validated = jobApplicationCreateSchema.parse(body);

    // Check if job post exists and is active
    const jobPost = await prisma.jobPost.findUnique({
      where: { id: validated.jobPostId, deletedAt: null },
    });

    if (!jobPost) {
      return NextResponse.json({ error: "Job post not found" }, { status: 404 });
    }

    if (jobPost.status !== "ACTIVE") {
      return NextResponse.json({ error: "Job post is not accepting applications" }, { status: 400 });
    }

    // Check if already applied
    const existing = await prisma.jobApplication.findUnique({
      where: {
        jobPostId_applicantId: {
          jobPostId: validated.jobPostId,
          applicantId: session.user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "You have already applied to this job" }, { status: 409 });
    }

    const application = await prisma.jobApplication.create({
      data: {
        ...validated,
        applicantId: session.user.id,
      },
      include: {
        jobPost: { include: { postedBy: { select: { id: true, displayName: true, name: true, image: true } } } },
        applicant: { select: { id: true, displayName: true, name: true, image: true } },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entity: "JobApplication",
        entityId: application.id,
        newData: JSON.stringify(application),
      },
    });

    // Notify job poster
    await prisma.notification.create({
      data: {
        userId: jobPost.postedById,
        type: "APPLICATION_UPDATE",
        title: "New Job Application",
        message: `${session.user.displayName || session.user.name || "Someone"} applied to ${jobPost.title}`,
        data: JSON.stringify({ applicationId: application.id, jobPostId: jobPost.id }),
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("JobApplication POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}