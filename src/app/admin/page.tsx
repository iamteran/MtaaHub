import Link from "next/link";
import {
  ArrowUpRight,
  ChevronRight,
  Clock,
  Eye,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { Sparkline } from "@/components/admin/sparkline";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Attention = {
  id: string;
  name: string;
  email: string;
  role: string;
  reports: number;
  lastReportAt: Date | null;
  score: number;
  drivers: { label: string; weight: number }[];
  series: number[];
};

const REPORT_LABELS: Record<string, string> = {
  SCAM: "Scam reports",
  FRAUDULENT_LISTING: "Fake listing reports",
  FAKE_LISTING: "Fake listing reports",
  SPAM: "Spam reports",
  ABUSE: "Abuse reports",
  INAPPROPRIATE_CONTENT: "Content reports",
  IMPERSONATION: "Impersonation reports",
  MISLEADING_INFO: "Misleading info",
  OTHER: "Other reports",
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

async function getData() {
  try {
    const [userCount, listingCount, jobCount, serviceCount, pendingVerifications, reports] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count({ where: { status: "ACTIVE" } }),
      prisma.jobPost.count({ where: { status: "ACTIVE" } }),
      prisma.serviceProvider.count(),
      prisma.verificationCheck.count({ where: { status: "PENDING" } }),
      prisma.report.findMany({ orderBy: { createdAt: "desc" }, take: 60 }),
    ]);

    const listingIds = [...new Set(reports.filter((r) => r.targetType === "Listing").map((r) => r.targetId))];
    const listings = listingIds.length
      ? await prisma.listing.findMany({
          where: { id: { in: listingIds } },
          select: { id: true, userId: true, user: { select: { id: true, displayName: true, name: true, email: true, role: true } } },
        })
      : [];

    const ownerByListing = new Map(listings.map((l) => [l.id, l.user]));

    const grouped = new Map<string, { user: (typeof listings)[number]["user"]; reports: number; lastAt: Date | null; types: Map<string, number> }>();
    for (const report of reports) {
      const owner = ownerByListing.get(report.targetId);
      if (!owner) continue;
      const entry = grouped.get(owner.id) ?? { user: owner, reports: 0, lastAt: null, types: new Map<string, number>() };
      entry.reports += 1;
      entry.lastAt = !entry.lastAt || report.createdAt > entry.lastAt ? report.createdAt : entry.lastAt;
      entry.types.set(report.type, (entry.types.get(report.type) ?? 0) + 1);
      grouped.set(owner.id, entry);
    }

    const attention: Attention[] = Array.from(grouped.values())
      .map((entry) => {
        const sortedTypes = [...entry.types.entries()].sort((a, b) => b[1] - a[1]);
        const drivers = sortedTypes.slice(0, 2).map(([type, count], index) => ({
          label: REPORT_LABELS[type] ?? "Community reports",
          weight: Number((0.05 + count * 0.015 - index * 0.01).toFixed(3)),
        }));

        const series = Array.from({ length: 7 }, (_, dayIndex) => {
          const day = new Date();
          day.setDate(day.getDate() - (6 - dayIndex));
          return reports.filter(
            (r) =>
              ownerByListing.get(r.targetId)?.id === entry.user.id &&
              r.createdAt.toDateString() === day.toDateString()
          ).length;
        });

        return {
          id: entry.user.id,
          name: entry.user.displayName ?? entry.user.name ?? entry.user.email,
          email: entry.user.email,
          role: entry.user.role,
          reports: entry.reports,
          lastReportAt: entry.lastAt,
          score: Number(clamp(0.16 + entry.reports * 0.08, 0, 0.96).toFixed(2)),
          drivers,
          series,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return { userCount, listingCount, jobCount, serviceCount, pendingVerifications, reports, attention };
  } catch {
    return {
      userCount: 0,
      listingCount: 0,
      jobCount: 0,
      serviceCount: 0,
      pendingVerifications: 0,
      reports: [] as { id: string; type: string; status: string; reason: string; createdAt: Date; targetType: string }[],
      attention: [] as Attention[],
    };
  }
}

export default async function AdminOverviewPage() {
  const { userCount, listingCount, jobCount, serviceCount, pendingVerifications, reports, attention } = await getData();

  const openReports = reports.filter((r) => ["PENDING", "UNDER_REVIEW", "ESCALATED"].includes(r.status));
  const critical = reports.filter((r) => r.type === "SCAM" && r.status === "PENDING").length;
  const elevated = reports.filter((r) => r.status === "UNDER_REVIEW" || r.status === "ESCALATED").length;
  const watching = attention.length;

  const health = clamp(100 - openReports.length * 4 - pendingVerifications * 2, 30, 99);
  const healthSeries = Array.from({ length: 7 }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - i));
    const daily = reports.filter((r) => r.createdAt.toDateString() === day.toDateString()).length;
    return clamp(100 - daily * 6, 40, 100);
  });

  const updated = new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });

  const kpis = [
    { label: "Users Monitored", value: userCount, delta: `+${userCount} this week`, tone: "emerald", icon: Users },
    { label: "Watching", value: watching, delta: `${watching} vs last 7 days`, tone: "amber", icon: Eye },
    { label: "Elevated", value: elevated, delta: `${elevated} vs last 7 days`, tone: "orange", icon: TrendingUp },
    { label: "Critical", value: critical, delta: `${critical} vs last 7 days`, tone: "rose", icon: ShieldAlert },
  ];

  const toneMap: Record<string, { text: string; bg: string; ring: string; stroke: string }> = {
    emerald: { text: "text-emerald-400", bg: "bg-emerald-500/10", ring: "ring-emerald-400/20", stroke: "#34D399" },
    amber: { text: "text-amber-300", bg: "bg-amber-500/10", ring: "ring-amber-400/20", stroke: "#FBBF24" },
    orange: { text: "text-orange-300", bg: "bg-orange-500/10", ring: "ring-orange-400/20", stroke: "#FB923C" },
    rose: { text: "text-rose-400", bg: "bg-rose-500/10", ring: "ring-rose-400/20", stroke: "#FB7185" },
  };

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-white">Overview</h1>
          <p className="mt-1 text-[13px] text-slate-500">Real-time community &amp; risk overview</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[12px] text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
            mtaahub.co.ke
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11.5px] text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            Updated {updated}
          </span>
        </div>
      </div>

      {/* kpis */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {/* community health */}
        <div className="rounded-xl border border-white/[0.06] bg-surface-850 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-medium text-slate-400">Community Health</p>
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.04] text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-[30px] font-semibold leading-none text-emerald-400">{health}</span>
            <span className="text-[13px] text-slate-500">/100</span>
          </div>
          <p className="mt-1.5 text-[11.5px] text-slate-400">
            <span className={health >= 90 ? "text-rose-400" : "text-emerald-400"}>
              {health >= 90 ? "▼" : "▲"} {Math.abs(100 - health)} pts
            </span>{" "}
            this week
          </p>
          <div className="mt-3">
            <Sparkline data={healthSeries} stroke="#34D399" area id="health" width={150} height={44} className="h-11 w-full" />
          </div>
        </div>

        {kpis.map((kpi) => {
          const tone = toneMap[kpi.tone];
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="rounded-xl border border-white/[0.06] bg-surface-850 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-medium text-slate-400">{kpi.label}</p>
                <span className={`flex h-6 w-6 items-center justify-center rounded-md ring-1 ring-inset ${tone.bg} ${tone.ring} ${tone.text}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-[30px] font-semibold leading-none text-white">{kpi.value}</span>
              </div>
              <p className={`mt-1.5 text-[11.5px] ${tone.text}`}>
                <span className="mr-1">■</span>
                {kpi.delta}
              </p>
              <div className="mt-4">
                <Sparkline
                  data={[3, 3, 3, 3, 3, 3, Math.max(3, kpi.value)]}
                  stroke={tone.stroke}
                  width={140}
                  height={22}
                  className="h-5 w-full opacity-70"
                  id={`kpi-${kpi.label}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* main grid */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        {/* users requiring attention */}
        <section className="h-fit self-start rounded-xl border border-white/[0.06] bg-surface-850">
          <div className="flex items-start justify-between gap-3 px-5 py-4">
            <div>
              <h2 className="text-[15px] font-semibold text-slate-100">Users requiring attention</h2>
              <p className="mt-0.5 text-[11.5px] text-slate-500">Sorted by risk score (high to low)</p>
            </div>
            <Link
              href="/admin/users"
              className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11.5px] font-medium text-slate-300 transition-colors hover:bg-white/[0.06]"
            >
              View all users
            </Link>
          </div>

          <div className="grid grid-cols-[1.4fr_.5fr_.8fr_1.3fr_.4fr] items-center gap-3 border-y border-white/[0.05] px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            <span>User</span>
            <span>Risk</span>
            <span>Trend (7d)</span>
            <span>Top drivers</span>
            <span className="text-right">Score</span>
          </div>

          {attention.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-[13px] text-slate-400">No accounts currently require attention.</p>
              <p className="mt-1 text-[11.5px] text-slate-600">Reported listings and services will surface here.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {attention.map((user) => {
                const banned = user.role === "SUSPENDED";
                return (
                  <div key={user.id} className="grid grid-cols-[1.4fr_.5fr_.8fr_1.3fr_.4fr] items-center gap-3 px-5 py-3.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500/80 to-pink-600/80 text-[11px] font-semibold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-medium text-slate-200">{user.name}</p>
                        <p className="truncate text-[10.5px] text-slate-600">{user.email}</p>
                      </div>
                    </div>

                    <span
                      className={`w-fit rounded-md px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${
                        banned ? "bg-rose-500/15 text-rose-400" : "bg-amber-500/15 text-amber-300"
                      }`}
                    >
                      {banned ? "Banned" : "Watching"}
                    </span>

                    <Sparkline
                      data={user.series.length > 1 ? user.series : [0, 1]}
                      stroke={banned ? "#FB7185" : "#FBBF24"}
                      width={90}
                      height={22}
                      className="h-5 w-full"
                      id={`trend-${user.id}`}
                    />

                    <div className="space-y-1">
                      {user.drivers.length === 0 && <span className="text-[11px] text-slate-600">—</span>}
                      {user.drivers.map((driver) => (
                        <div key={driver.label} className="flex items-center gap-1.5 text-[10.5px]">
                          <span className={`h-1 w-1 rounded-full ${banned ? "bg-rose-400" : "bg-amber-400"}`} />
                          <span className="truncate text-slate-400">{driver.label}</span>
                          <span className="ml-auto text-slate-500">+{driver.weight.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-end gap-1">
                      <span className="text-[12.5px] font-semibold text-slate-200">{user.score.toFixed(2)}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-white/[0.05] px-5 py-3 text-[11.5px] text-slate-500">
            <span>{listingCount} active listings · {jobCount} jobs · {serviceCount} service providers</span>
            <Link href="/admin/reports" className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200">
              Open escalations <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </section>

        {/* escalations */}
        <section className="h-fit self-start rounded-xl border border-white/[0.06] bg-surface-850">
          <div className="flex items-start justify-between gap-3 px-5 py-4">
            <div>
              <h2 className="text-[15px] font-semibold text-slate-100">Escalations</h2>
              <p className="mt-0.5 text-[11.5px] text-slate-500">Recent state changes &amp; important events</p>
            </div>
            <Link
              href="/admin/reports"
              className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11.5px] font-medium text-slate-300 transition-colors hover:bg-white/[0.06]"
            >
              View all
            </Link>
          </div>

          <div className="space-y-1 px-3 pb-3">
            {reports.slice(0, 4).map((report) => {
              const isCritical = report.type === "SCAM" || report.status === "ESCALATED";
              const isResolved = report.status === "RESOLVED" || report.status === "DISMISSED";
              return (
                <div key={report.id} className="flex gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-white/[0.03]">
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      isResolved
                        ? "bg-emerald-500/10 text-emerald-400"
                        : isCritical
                          ? "bg-rose-500/10 text-rose-400"
                          : "bg-amber-500/10 text-amber-300"
                    }`}
                  >
                    {isResolved ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10.5px] text-slate-600">{timeAgo(report.createdAt)}</p>
                    <p className="mt-0.5 truncate text-[12.5px] font-semibold text-slate-200">
                      {REPORT_LABELS[report.type] ?? "Community report"} on {report.targetType.toLowerCase()}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-slate-500">{report.reason}</p>
                  </div>
                  <Link
                    href="/admin/reports"
                    className="mt-1 h-fit shrink-0 rounded-md border border-white/[0.08] px-2 py-1 text-[10.5px] font-medium text-slate-300 hover:bg-white/[0.06]"
                  >
                    Review
                  </Link>
                </div>
              );
            })}

            {reports.length === 0 && (
              <p className="px-3 py-10 text-center text-[12.5px] text-slate-500">Nothing escalated. The community is quiet.</p>
            )}
          </div>

          <div className="border-t border-white/[0.05] px-5 py-3">
            <Link href="/admin/reports" className="text-[11.5px] font-medium text-blue-400 hover:text-blue-300">
              View all escalations →
            </Link>
          </div>
        </section>
      </div>

      {/* footer strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-surface-850 px-5 py-3 text-[11.5px] text-slate-500">
        <span className="inline-flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          All systems operational · {pendingVerifications} verifications pending
        </span>
        <span>MtaaHub admin · Nairobi region</span>
      </div>
    </div>
  );
}
