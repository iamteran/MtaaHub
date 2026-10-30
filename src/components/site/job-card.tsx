import Link from "next/link";
import { Clock, MapPin, ArrowUpRight } from "lucide-react";
import { formatKSH, timeAgo, titleCase } from "@/lib/utils";

export type JobCardData = {
  id: string;
  title: string;
  companyName: string | null;
  jobType: string;
  category: string;
  county: string;
  town: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryPeriod: string | null;
  isRemote: boolean;
  createdAt: Date;
  _count?: { applications: number };
};

export function JobCard({ job }: { job: JobCardData }) {
  const salary =
    job.salaryMin && job.salaryMax
      ? `${formatKSH(job.salaryMin, { compact: true })} – ${formatKSH(job.salaryMax, { compact: true })}`
      : job.salaryMin
        ? `From ${formatKSH(job.salaryMin, { compact: true })}`
        : job.salaryMax
          ? `Up to ${formatKSH(job.salaryMax, { compact: true })}`
          : "Negotiable";

  const company = job.companyName ?? "Private employer";

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-float"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-[15px] font-bold text-primary-800">
          {company.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 text-[15px] font-semibold text-ink-900 group-hover:text-primary-800">{job.title}</h3>
          <p className="mt-0.5 truncate text-[12.5px] text-ink-500">{company}</p>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-300 transition-colors group-hover:text-primary-600" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-primary-50 px-2 py-1 text-[10.5px] font-semibold text-primary-800">{titleCase(job.jobType)}</span>
        <span className="rounded-md bg-ink-50 px-2 py-1 text-[10.5px] font-medium text-ink-600">{job.category}</span>
        {job.isRemote && (
          <span className="rounded-md bg-blue-50 px-2 py-1 text-[10.5px] font-medium text-blue-700">Remote</span>
        )}
      </div>

      <p className="mt-3 flex items-center gap-1 text-[12px] text-ink-500">
        <MapPin className="h-3.5 w-3.5" />
        {[job.town, job.county].filter(Boolean).join(", ")}
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-ink-100 pt-3">
        <span className="text-[14px] font-bold text-primary-700">
          {salary}
          {job.salaryMin || job.salaryMax ? (
            <span className="text-[10.5px] font-medium text-ink-400"> /{(job.salaryPeriod ?? "MONTHLY").toLowerCase()}</span>
          ) : null}
        </span>
        <span className="inline-flex items-center gap-1 text-[10.5px] text-ink-400">
          <Clock className="h-3 w-3" />
          {timeAgo(job.createdAt)}
        </span>
      </div>
    </Link>
  );
}
