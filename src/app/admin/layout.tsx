import prisma from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbarActions } from "@/components/admin/topbar-actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin console",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let pendingReports = 0;
  try {
    pendingReports = await prisma.report.count({ where: { status: { in: ["PENDING", "UNDER_REVIEW", "ESCALATED"] } } });
  } catch {
    pendingReports = 0;
  }

  const updated = new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-surface-950 text-slate-200 selection:bg-blue-500/30">
      <AdminSidebar counts={{ reports: pendingReports }} />

      <div className="ml-[244px] min-h-screen">
        <header className="sticky top-0 z-30 flex h-[52px] items-center gap-3 border-b border-white/[0.06] bg-surface-950/85 px-6 backdrop-blur">
          <p className="text-[13px] font-medium text-slate-300">
            MtaaHub <span className="mx-1.5 text-slate-600">—</span>
            <span className="text-slate-500">moderation dashboard</span>
          </p>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-400 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live · updated {updated}
            </span>
            <AdminTopbarActions />
          </div>
        </header>

        <main className="px-6 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
