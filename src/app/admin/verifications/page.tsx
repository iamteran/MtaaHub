import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Verifications" };

export default async function AdminVerificationsPage() {
  const checks = await prisma.verificationCheck
    .findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      include: {
        listing: { select: { id: true, title: true } },
        provider: { select: { id: true, name: true } },
        checker: { select: { displayName: true, name: true } },
      },
    })
    .catch(() => []);

  const pending = checks.filter((c) => c.status === "PENDING").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-white">Verifications</h1>
          <p className="mt-1 text-[13px] text-slate-500">{pending} pending · {checks.length} total checks</p>
        </div>
        <Link href="/admin" className="text-[12px] text-slate-400 hover:text-slate-200">
          ← Back to overview
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-surface-850">
        <div className="grid grid-cols-[1.6fr_.7fr_.7fr_.9fr] gap-3 border-b border-white/[0.05] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          <span>Subject</span>
          <span>Type</span>
          <span>Status</span>
          <span>Checked</span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {checks.map((check) => (
            <div key={check.id} className="grid grid-cols-[1.6fr_.7fr_.7fr_.9fr] items-center gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-[12.5px] text-slate-200">
                  {check.listing?.title ?? check.provider?.name ?? "Unlinked subject"}
                </p>
                <p className="truncate text-[10.5px] text-slate-600">
                  by {check.checker.displayName ?? check.checker.name ?? "—"}
                </p>
              </div>
              <span className="text-[11px] uppercase tracking-wide text-slate-400">{check.type}</span>
              <span
                className={`w-fit rounded-md px-1.5 py-0.5 text-[9.5px] font-bold uppercase ${
                  check.status === "VERIFIED"
                    ? "bg-emerald-500/15 text-emerald-300"
                    : check.status === "REJECTED"
                      ? "bg-rose-500/15 text-rose-400"
                      : "bg-amber-500/15 text-amber-300"
                }`}
              >
                {check.status}
              </span>
              <span className="text-[11.5px] text-slate-500">{formatDate(check.createdAt)}</span>
            </div>
          ))}
          {checks.length === 0 && (
            <p className="px-5 py-10 text-center text-[12.5px] text-slate-500">No verification checks yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
