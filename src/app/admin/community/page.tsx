import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatKSH, pct } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Community" };

export default async function AdminCommunityPage() {
  const [byCounty, byType, activeListings, users] = await Promise.all([
    prisma.location
      .groupBy({ by: ["county"], _count: { _all: true }, orderBy: { _count: { county: "desc" } }, take: 8 })
      .catch(() => []),
    prisma.listing
      .groupBy({ by: ["propertyType"], _count: { _all: true }, orderBy: { _count: { propertyType: "desc" } }, take: 8 })
      .catch(() => []),
    prisma.listing
      .aggregate({ where: { status: "ACTIVE" }, _avg: { rent: true }, _count: { _all: true } })
      .catch(() => ({ _avg: { rent: 0 }, _count: { _all: 0 } })),
    prisma.user.count().catch(() => 0),
  ]);

  const totalListings = byType.reduce((sum, row) => sum + row._count._all, 0) || 1;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-white">Community</h1>
          <p className="mt-1 text-[13px] text-slate-500">Supply and demand across the platform</p>
        </div>
        <Link href="/admin" className="text-[12px] text-slate-400 hover:text-slate-200">
          ← Back to overview
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-white/[0.06] bg-surface-850 p-5">
          <p className="text-[11.5px] text-slate-500">Registered users</p>
          <p className="mt-2 text-[26px] font-semibold text-white">{users}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-surface-850 p-5">
          <p className="text-[11.5px] text-slate-500">Active listings</p>
          <p className="mt-2 text-[26px] font-semibold text-white">{activeListings._count._all}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-surface-850 p-5">
          <p className="text-[11.5px] text-slate-500">Average rent</p>
          <p className="mt-2 text-[26px] font-semibold text-white">{formatKSH(Math.round(activeListings._avg.rent ?? 0))}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-white/[0.06] bg-surface-850 p-5">
          <h2 className="text-[14px] font-semibold text-slate-100">Listings by type</h2>
          <div className="mt-4 space-y-3">
            {byType.map((row) => (
              <div key={row.propertyType}>
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="text-slate-300">{row.propertyType}</span>
                  <span className="text-slate-500">{row._count._all} · {pct(row._count._all, totalListings)}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                  <div className="h-full rounded-full bg-blue-400/70" style={{ width: `${pct(row._count._all, totalListings)}%` }} />
                </div>
              </div>
            ))}
            {byType.length === 0 && <p className="text-[12px] text-slate-500">No listings yet.</p>}
          </div>
        </section>

        <section className="rounded-xl border border-white/[0.06] bg-surface-850 p-5">
          <h2 className="text-[14px] font-semibold text-slate-100">Top counties</h2>
          <div className="mt-4 space-y-2">
            {byCounty.map((row) => (
              <div key={row.county} className="flex items-center justify-between border-b border-white/[0.04] pb-2 text-[12px] last:border-0">
                <span className="text-slate-300">{row.county || "Unspecified"}</span>
                <span className="text-slate-500">{row._count._all} areas</span>
              </div>
            ))}
            {byCounty.length === 0 && <p className="text-[12px] text-slate-500">No locations seeded.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
