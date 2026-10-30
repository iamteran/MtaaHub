import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Plus, Search, SlidersHorizontal } from "lucide-react";
import prisma from "@/lib/prisma";
import { JobCard, type JobCardData } from "@/components/site/job-card";
import { JOB_CATEGORIES, KENYAN_COUNTIES } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "KaziHub — Find opportunities",
  description: "Jobs, internships, attachments and remote work across Kenya. Free for job seekers.",
};

type Params = {
  county?: string;
  category?: string;
  jobType?: string;
  q?: string;
};

const JOB_TYPES = ["full_time", "part_time", "contract", "internship", "attachment", "remote"];

export default async function JobsPage({ searchParams }: { searchParams: Params }) {
  const { county, category, jobType, q } = searchParams;

  const where: Record<string, unknown> = { status: "ACTIVE" };
  if (county) where.county = county;
  if (category) where.category = category;
  if (jobType) where.jobType = jobType;
  if (q) where.OR = [{ title: { contains: q } }, { companyName: { contains: q } }, { description: { contains: q } }];

  const jobs = await prisma.jobPost
    .findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 24,
      include: { _count: { select: { applications: true } } },
    })
    .catch(() => []);

  const total = await prisma.jobPost.count({ where }).catch(() => 0);
  const activeFilters = [county, category, jobType, q].filter(Boolean).length;

  return (
    <div className="bg-ink-50/50">
      <section className="border-b border-ink-100 bg-white">
        <div className="container-main py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">KaziHub</p>
              <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
                Find work that fits your life
              </h1>
              <p className="mt-2 max-w-xl text-[15px] text-ink-600">
                {total > 0 ? `${total} open opportunities from verified employers.` : "No open roles yet — employers post free."}
              </p>
            </div>
            <Link
              href="/jobs/post"
              className="inline-flex items-center gap-2 rounded-full bg-primary-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
            >
              <Plus className="h-4 w-4" /> Post a job
            </Link>
          </div>
        </div>
      </section>

      <div className="container-main -mt-5">
        <form action="/jobs" method="get" className="rounded-2xl border border-ink-100 bg-white p-3 shadow-card">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search role or company"
              className="input-base h-11 lg:col-span-2"
              aria-label="Search jobs"
            />
            <select name="county" defaultValue={county ?? ""} className="input-base h-11 py-0" aria-label="County">
              <option value="">All counties</option>
              {KENYAN_COUNTIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select name="jobType" defaultValue={jobType ?? ""} className="input-base h-11 py-0" aria-label="Job type">
              <option value="">Any job type</option>
              {JOB_TYPES.map((t) => (
                <option key={t} value={t} className="capitalize">
                  {t.replace("_", " ")}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
            >
              <Search className="h-4 w-4" /> Search
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between px-1 text-[11.5px] text-ink-500">
            <span className="inline-flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {category ? `Category: ${category}` : activeFilters > 0 ? `${activeFilters} filter(s) applied` : "Showing everything"}
            </span>
            {activeFilters > 0 && (
              <Link href="/jobs" className="font-medium text-primary-700 hover:underline">
                Clear filters
              </Link>
            )}
          </div>
        </form>
      </div>

      <section className="container-main py-10">
        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
              <Briefcase className="h-7 w-7" />
            </span>
            <h2 className="mt-4 font-display text-xl font-bold text-ink-900">No opportunities match that search</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-600">
              Try a different county or job type. Employers post new roles every week.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/jobs" className="rounded-full border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-800 hover:bg-ink-50">
                Clear filters
              </Link>
              <Link href="/jobs/post" className="rounded-full bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-800">
                Post a job
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job as unknown as JobCardData} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
