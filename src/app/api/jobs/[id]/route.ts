import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const jobPostUpdateSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(20).max(10000).optional(),
  companyName: z.string().min(2).max(200).optional(),
  companyEmail: z.string().email().optional().nullable(),
  companyPhone: z.string().optional().nullable(),
  companyWebsite: z.string().url().optional().nullable(),
  jobType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "ATTACHMENT", "APPRENTICESHIP", "SCHOLARSHIP", "REMOTE"]).optional(),
  category: z.string().min(1).max(100).optional(),
  county: z.string().min(1).optional(),
  town: z.string().optional().nullable(),
  estate: z.string().optional().nullable(),
  isRemote: z.boolean().optional(),
  salaryMin: z.number().int().positive().optional().nullable(),
  salaryMax: z.number().int().positive().optional().nullable(),
  salaryPeriod: z.enum(["monthly", "daily", "hourly", "annually"]).optional().nullable(),
  benefits: z.string().optional().nullable(),
  requirements: z.string().optional().nullable(),
  applicationUrl: z.string().url().optional().nullable(),
  applicationEmail: z.string().email().optional().nullable(),
  applicationPhone: z.string().optional().nullable(),
  deadline: z.string().datetime().optional().nullable(),
  status: z.enum(["DRAFT", "PENDING_REVIEW", "ACTIVE", "EXPIRED", "WITHDRAWN", "RENTED", "SUSPENDED", "STALE"]).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const jobPost = await prisma.jobPost.findUnique({
      where: { id },
      include: {
        postedBy: {
          select: { id: true, displayName: true, name: true, image: true, phone: true, email: true, createdAt: true },
        },
      },
    });

    if (!jobPost) {
      return NextResponse.json({ error: "Job post not found" }, { status: 404 });
    }

    // Increment view count
    await prisma.jobPost.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(jobPost);
  } catch (error) {
    console.error("JobPost GET error:", error);
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
    const validated = jobPostUpdateSchema.parse(body);

    const jobPost = await prisma.jobPost.findUnique({
      where: { id },
    });

    if (!jobPost) {
      return NextResponse.json({ error: "Job post not found" }, { status: 404 });
    }

    // Check ownership or admin
    if (jobPost.postedById !== session.user.id && !["SUPER_ADMIN", "MODERATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const oldData = JSON.stringify(jobPost);

    const updateData: any = { ...validated };
    if (validated.deadline !== undefined) {
      updateData.deadline = validated.deadline ? new Date(validated.deadline) : null;
    }

    const updatedJobPost = await prisma.jobPost.update({
      where: { id },
      data: updateData,
      include: {
        postedBy: { select: { id: true, displayName: true, name: true, image: true } },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        entity: "JobPost",
        entityId: id,
        oldData,
        newData: JSON.stringify(updatedJobPost),
      },
    });

    return NextResponse.json(updatedJobPost);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("JobPost PUT error:", error);
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

    const jobPost = await prisma.jobPost.findUnique({
      where: { id },
    });

    if (!jobPost) {
      return NextResponse.json({ error: "Job post not found" }, { status: 404 });
    }

    // Check ownership or admin
    if (jobPost.postedById !== session.user.id && !["SUPER_ADMIN", "MODERATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft delete - just update status
    await prisma.jobPost.update({
      where: { id },
      data: { status: "WITHDRAWN" },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        entity: "JobPost",
        entityId: id,
        oldData: JSON.stringify(jobPost),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("JobPost DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}