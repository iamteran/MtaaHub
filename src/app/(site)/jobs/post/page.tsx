import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { createJob } from "@/app/actions";
import { JOB_CATEGORIES, KENYAN_COUNTIES } from "@/lib/utils";

export const metadata: Metadata = { title: "Post a job" };
export const dynamic = "force-dynamic";

const JOB_TYPES = [
  { value: "full_time", label: "Full time" },
  { value: "part_time", label: "Part time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "attachment", label: "Industrial attachment" },
  { value: "remote", label: "Remote" },
];

export default function PostJobPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="bg-ink-50/50 pb-16">
      <div className="container-main pt-6">
        <Link href="/jobs" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-ink-900">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to jobs
        </Link>
      </div>

      <div className="container-main mt-4 max-w-3xl">
        <div className="rounded-2xl border border-ink-100 bg-white p-6 sm:p-8">
          <p className="eyebrow">KaziHub</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink-900">Post a job — free</h1>
          <p className="mt-1.5 text-[13.5px] text-ink-600">Reach job seekers across Kenya. No listing fee, ever.</p>

          {searchParams.error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[12.5px] text-red-700" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {searchParams.error}
            </div>
          )}

          <form action={createJob} className="mt-6 space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="title" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Job title
                </label>
                <input id="title" name="title" required placeholder="e.g. Customer Service Agent" className="input-base" />
              </div>
              <div>
                <label htmlFor="companyName" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Company
                </label>
                <input id="companyName" name="companyName" placeholder="e.g. Safaricom" className="input-base" />
              </div>

              <div>
                <label htmlFor="jobType" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Job type
                </label>
                <select id="jobType" name="jobType" required defaultValue="full_time" className="input-base">
                  {JOB_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="category" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Category
                </label>
                <select id="category" name="category" defaultValue="Technology" className="input-base">
                  {JOB_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="county" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  County
                </label>
                <select id="county" name="county" required defaultValue="Nairobi" className="input-base">
                  {KENYAN_COUNTIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="town" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Town / area
                </label>
                <input id="town" name="town" placeholder="e.g. Westlands" className="input-base" />
              </div>

              <div>
                <label htmlFor="salaryMin" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Salary from (KSh/month)
                </label>
                <input id="salaryMin" name="salaryMin" type="number" min="0" placeholder="45000" className="input-base" />
              </div>
              <div>
                <label htmlFor="salaryMax" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Salary to (KSh/month)
                </label>
                <input id="salaryMax" name="salaryMax" type="number" min="0" placeholder="60000" className="input-base" />
              </div>
            </div>

            <label className="flex items-center gap-2 text-[12.5px] text-ink-700">
              <input type="checkbox" name="isRemote" className="h-3.5 w-3.5 rounded border-ink-300 text-primary-700" />
              This role can be done remotely
            </label>

            <div>
              <label htmlFor="description" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                Role description
              </label>
              <textarea
                id="description"
                name="description"
                required
                minLength={20}
                rows={5}
                placeholder="Responsibilities, requirements, and how to apply…"
                className="input-base resize-y"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="applicationEmail" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Application email
                </label>
                <input id="applicationEmail" name="applicationEmail" type="email" placeholder="hr@company.co.ke" className="input-base" />
              </div>
              <div>
                <label htmlFor="applicationUrl" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Application link
                </label>
                <input id="applicationUrl" name="applicationUrl" type="url" placeholder="https://…" className="input-base" />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary-700 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
            >
              Publish job
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
