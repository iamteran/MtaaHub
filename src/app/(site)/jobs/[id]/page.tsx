import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Briefcase, Building2, Clock, Mail, MapPin, Wallet, Globe } from "lucide-react";
import prisma from "@/lib/prisma";
import { formatKSH, safeJsonParse, timeAgo, titleCase } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const job = await prisma.jobPost.findUnique({ where: { id: params.id }, select: { title: true, description: true } }).catch(() => null);
  if (!job) return { title: "Job not found" };
  return { title: `${job.title}`, description: job.description.slice(0, 150) };
}

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = await prisma.jobPost
    .findUnique({
      where: { id: params.id },
      include: {
        postedBy: { select: { displayName: true, name: true } },
        _count: { select: { applications: true } },
      },
    })
    .catch(() => null);

  if (!job) notFound();

  const requirements = safeJsonParse<string[]>(job.requirements, []);
  const salary =
    job.salaryMin && job.salaryMax
      ? `${formatKSH(job.salaryMin)} – ${formatKSH(job.salaryMax)}`
      : job.salaryMin
        ? `From ${formatKSH(job.salaryMin)}`
        : job.salaryMax
          ? `Up to ${formatKSH(job.salaryMax)}`
          : "Negotiable";

  return (
    <div className="bg-ink-50/50 pb-16">
      <div className="container-main pt-6">
        <Link href="/jobs" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-ink-900">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to jobs
        </Link>
      </div>

      <div className="container-main mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr]">
        <article className="rounded-2xl border border-ink-100 bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-lg font-bold text-primary-800">
              {(job.companyName ?? "P").charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">{job.title}</h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-500">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" /> {job.companyName ?? "Private employer"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {[job.town, job.county].filter(Boolean).join(", ")}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {timeAgo(job.createdAt)}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-lg bg-primary-50 px-3 py-1.5 text-[11.5px] font-semibold text-primary-800">{titleCase(job.jobType)}</span>
            <span className="rounded-lg bg-ink-50 px-3 py-1.5 text-[11.5px] font-medium text-ink-700">{job.category}</span>
            {job.isRemote && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-[11.5px] font-medium text-blue-700">
                <Globe className="h-3.5 w-3.5" /> Remote
              </span>
            )}
          </div>

          <div className="mt-6 rounded-xl bg-primary-50/70 p-4">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-800">
              <Wallet className="h-4 w-4" /> Salary
            </p>
            <p className="mt-1 text-lg font-bold text-ink-900">
              {salary} <span className="text-[12px] font-medium text-ink-500">/{(job.salaryPeriod ?? "MONTHLY").toLowerCase()}</span>
            </p>
          </div>

          <section className="mt-7">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-500">About the role</h2>
            <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-ink-700">{job.description}</p>
          </section>

          {job.benefits && (
            <section className="mt-6">
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-500">Benefits</h2>
              <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-ink-700">{job.benefits}</p>
            </section>
          )}

          {requirements.length > 0 && (
            <section className="mt-6">
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-500">Requirements</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[14px] text-ink-700">
                {requirements.map((req) => (
                  <li key={req}>{req}</li>
                ))}
              </ul>
            </section>
          )}

          <p className="mt-8 text-[11.5px] text-ink-400">
            Posted by {job.postedBy.displayName ?? job.postedBy.name ?? "an employer"} · {job._count.applications} applications ·{" "}
            {job.viewCount} views
          </p>
        </article>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
            <h2 className="font-display text-lg font-bold text-ink-900">How to apply</h2>
            <p className="mt-1.5 text-[12.5px] text-ink-600">
              Applications go directly to the employer. MtaaHub never charges job seekers.
            </p>

            <div className="mt-4 space-y-2.5">
              {job.applicationUrl && (
                <a
                  href={job.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-700 text-sm font-semibold text-white hover:bg-primary-800"
                >
                  <Briefcase className="h-4 w-4" /> Apply online
                </a>
              )}
              {job.applicationEmail && (
                <a
                  href={`mailto:${job.applicationEmail}`}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-ink-200 text-sm font-semibold text-ink-800 hover:bg-ink-50"
                >
                  <Mail className="h-4 w-4" /> Email application
                </a>
              )}
              {job.applicationPhone && (
                <a
                  href={`tel:${job.applicationPhone}`}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-ink-200 text-sm font-semibold text-ink-800 hover:bg-ink-50"
                >
                  Call {job.applicationPhone}
                </a>
              )}
              {!job.applicationUrl && !job.applicationEmail && !job.applicationPhone && (
                <p className="rounded-xl bg-ink-50 p-3 text-[12px] text-ink-600">
                  This employer has not added contact details yet. Check back soon.
                </p>
              )}
            </div>

            {job.deadline && (
              <p className="mt-4 text-[11.5px] text-ink-500">
                Application deadline: {job.deadline.toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
