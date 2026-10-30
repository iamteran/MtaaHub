import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const jobApplicationUpdateSchema = z.object({
  status: z.enum(["APPLIED", "REVIEWING", "SHORTLISTED", "INTERVIEW", "OFFERED", "REJECTED", "WITHDRAWN"]).optional(),
  coverLetter: z.string().max(5000).optional().nullable(),
  resumeUrl: z.string().url().optional().nullable(),
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

    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: {
        jobPost: {
          include: {
            postedBy: { select: { id: true, displayName: true, name: true, image: true } },
          },
        },
        applicant: { select: { id: true, displayName: true, name: true, image: true, email: true } },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Check access - applicant or job poster or admin
    const isApplicant = application.applicantId === session.user.id;
    const isPoster = application.jobPost.postedById === session.user.id;
    const isAdmin = ["SUPER_ADMIN", "MODERATOR"].includes(session.user.role);

    if (!isApplicant && !isPoster && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("JobApplication GET error:", error);
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
    const validated = jobApplicationUpdateSchema.parse(body);

    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: {
        jobPost: {
          include: {
            postedBy: { select: { id: true, displayName: true, name: true } },
          },
        },
        applicant: { select: { id: true, displayName: true, name: true } },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Check permissions
    const isApplicant = application.applicantId === session.user.id;
    const isPoster = application.jobPost.postedById === session.user.id;
    const isAdmin = ["SUPER_ADMIN", "MODERATOR"].includes(session.user.role);

    // Applicants can only withdraw, posters can update status
    if (isApplicant && validated.status && validated.status !== "WITHDRAWN") {
      return NextResponse.json({ error: "Applicants can only withdraw applications" }, { status: 403 });
    }

    if (!isApplicant && !isPoster && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const oldData = JSON.stringify(application);

    const updatedApplication = await prisma.jobApplication.update({
      where: { id },
      data: validated,
      include: {
        jobPost: {
          include: {
            postedBy: { select: { id: true, displayName: true, name: true, image: true } },
          },
        },
        applicant: { select: { id: true, displayName: true, name: true, image: true } },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        entity: "JobApplication",
        entityId: id,
        oldData,
        newData: JSON.stringify(updatedApplication),
      },
    });

    // Notify relevant party
    if (validated.status) {
      if (isPoster || isAdmin) {
        // Notify applicant
        await prisma.notification.create({
          data: {
            userId: application.applicantId,
            type: "APPLICATION_UPDATE",
            title: "Application Status Updated",
            message: `Your application for ${application.jobPost.title} has been ${validated.status.toLowerCase()}.`,
            data: JSON.stringify({ applicationId: id, status: validated.status }),
          },
        });
      } else if (isApplicant && validated.status === "WITHDRAWN") {
        // Notify poster
        await prisma.notification.create({
          data: {
            userId: application.jobPost.postedById,
            type: "APPLICATION_UPDATE",
            title: "Application Withdrawn",
            message: `${application.applicant.displayName || application.applicant.name} withdrew their application for ${application.jobPost.title}.`,
            data: JSON.stringify({ applicationId: id, status: "WITHDRAWN" }),
          },
        });
      }
    }

    return NextResponse.json(updatedApplication);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("JobApplication PUT error:", error);
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

    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: {
        jobPost: { select: { id: true, title: true, postedById: true } },
        applicant: { select: { id: true, displayName: true, name: true } },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Only applicant or admin can delete
    const isApplicant = application.applicantId === session.user.id;
    const isAdmin = ["SUPER_ADMIN", "MODERATOR"].includes(session.user.role);

    if (!isApplicant && !isAdmin) {
      return NextResponse.json({ error: "Only the applicant can delete their application" }, { status: 403 });
    }

    await prisma.jobApplication.delete({ where: { id } });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        entity: "JobApplication",
        entityId: id,
        oldData: JSON.stringify(application),
      },
    });

    // Notify poster
    await prisma.notification.create({
      data: {
        userId: application.jobPost.postedById,
        type: "APPLICATION_UPDATE",
        title: "Application Deleted",
        message: `${application.applicant.displayName || application.applicant.name} deleted their application for ${application.jobPost.title}.`,
        data: JSON.stringify({ applicationId: id }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("JobApplication DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}