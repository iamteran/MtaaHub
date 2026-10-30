import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const jobPostCreateSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(10000),
  companyName: z.string().min(2).max(200),
  companyEmail: z.string().email().optional(),
  companyPhone: z.string().optional(),
  companyWebsite: z.string().url().optional().or(z.literal("")),
  jobType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "ATTACHMENT", "APPRENTICESHIP", "SCHOLARSHIP", "REMOTE"]),
  category: z.string().min(1).max(100),
  county: z.string().min(1),
  town: z.string().optional(),
  estate: z.string().optional(),
  isRemote: z.boolean().default(false),
  salaryMin: z.number().int().positive().optional(),
  salaryMax: z.number().int().positive().optional(),
  salaryPeriod: z.enum(["monthly", "daily", "hourly", "annually"]).optional(),
  benefits: z.string().optional(),
  requirements: z.string().optional(),
  applicationUrl: z.string().url().optional().or(z.literal("")),
  applicationEmail: z.string().email().optional().or(z.literal("")),
  applicationPhone: z.string().optional(),
  deadline: z.string().datetime().optional(),
});

const jobPostUpdateSchema = jobPostCreateSchema.partial().extend({
  status: z.enum(["DRAFT", "PENDING_REVIEW", "ACTIVE", "EXPIRED", "WITHDRAWN", "RENTED", "SUSPENDED", "STALE"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const status = searchParams.get("status") || "ACTIVE";
    const jobType = searchParams.get("jobType");
    const category = searchParams.get("category");
    const county = searchParams.get("county");
    const town = searchParams.get("town");
    const isRemote = searchParams.get("isRemote");
    const postedById = searchParams.get("postedById");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "newest";

    const skip = (page - 1) * limit;

    const where: any = {
      status: status === "all" ? undefined : status,
          };

    if (jobType) where.jobType = jobType;
    if (category) where.category = category;
    if (county) where.county = county;
    if (town) where.town = town;
    if (isRemote === "true") where.isRemote = true;
    if (postedById) where.postedById = postedById;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { companyName: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const orderBy: any = {};
    switch (sortBy) {
      case "oldest":
        orderBy.createdAt = "asc";
        break;
      case "salary_asc":
        orderBy.salaryMin = "asc";
        break;
      case "salary_desc":
        orderBy.salaryMin = "desc";
        break;
      case "deadline":
        orderBy.deadline = "asc";
        break;
      case "newest":
      default:
        orderBy.createdAt = "desc";
        break;
    }

    const [jobs, total] = await Promise.all([
      prisma.jobPost.findMany({
        where,
        include: {
          postedBy: { select: { id: true, displayName: true, name: true, image: true, createdAt: true } },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.jobPost.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: jobs,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("Jobs GET error:", error);
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
    const validated = jobPostCreateSchema.parse(body);

    const jobPost = await prisma.jobPost.create({
      data: {
        ...validated,
        deadline: validated.deadline ? new Date(validated.deadline) : null,
        postedById: session.user.id,
      },
      include: {
        postedBy: { select: { id: true, displayName: true, name: true, image: true } },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entity: "JobPost",
        entityId: jobPost.id,
        newData: JSON.stringify(jobPost),
      },
    });

    return NextResponse.json(jobPost, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("JobPost POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}