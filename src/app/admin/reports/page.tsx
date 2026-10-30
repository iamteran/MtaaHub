import Link from "next/link";
import prisma from "@/lib/prisma";
import { adminUpdateReport } from "@/app/actions";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "Escalations" };

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-300",
  UNDER_REVIEW: "bg-blue-500/15 text-blue-300",
  ESCALATED: "bg-rose-500/15 text-rose-400",
  RESOLVED: "bg-emerald-500/15 text-emerald-300",
  DISMISSED: "bg-white/[0.06] text-slate-400",
};

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({ orderBy: { createdAt: "desc" }, take: 50 }).catch(() => []);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-white">Escalations</h1>
          <p className="mt-1 text-[13px] text-slate-500">Community reports awaiting moderation</p>
        </div>
        <Link href="/admin" className="text-[12px] text-slate-400 hover:text-slate-200">
          ← Back to overview
        </Link>
      </div>

      <div className="space-y-3">
        {reports.map((report) => (
          <div key={report.id} className="rounded-xl border border-white/[0.06] bg-surface-850 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`rounded-md px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${STATUS_STYLES[report.status] ?? STATUS_STYLES.PENDING}`}>
                    {report.status.replace("_", " ")}
                  </span>
                  <span className="text-[10.5px] text-slate-600">
                    {report.type} · {report.targetType} · {timeAgo(report.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-[13px] text-slate-200">{report.reason}</p>
                <p className="mt-1 text-[10.5px] text-slate-600">target: {report.targetId}</p>
              </div>

              <form action={adminUpdateReport} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="reportId" value={report.id} />
                <select
                  name="status"
                  defaultValue={report.status}
                  className="rounded-lg border border-white/[0.09] bg-surface-900 px-2.5 py-1.5 text-[11.5px] text-slate-200 focus:outline-none"
                >
                  {["PENDING", "UNDER_REVIEW", "ESCALATED", "RESOLVED", "DISMISSED"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  name="resolution"
                  placeholder="Resolution note"
                  className="w-44 rounded-lg border border-white/[0.09] bg-surface-900 px-2.5 py-1.5 text-[11.5px] text-slate-200 placeholder:text-slate-600 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-blue-500/15 px-3 py-1.5 text-[11.5px] font-medium text-blue-300 ring-1 ring-inset ring-blue-400/20 transition-colors hover:bg-blue-500/25"
                >
                  Update
                </button>
              </form>
            </div>
          </div>
        ))}

        {reports.length === 0 && (
          <div className="rounded-xl border border-white/[0.06] bg-surface-850 px-5 py-12 text-center text-[12.5px] text-slate-500">
            No reports have been filed.
          </div>
        )}
      </div>
    </div>
  );
}
