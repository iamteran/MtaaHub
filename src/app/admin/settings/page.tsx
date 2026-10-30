import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const settings = await prisma.setting.findMany({ orderBy: { key: "asc" } }).catch(() => []);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-white">Settings</h1>
          <p className="mt-1 text-[13px] text-slate-500">Platform configuration stored in the database</p>
        </div>
        <Link href="/admin" className="text-[12px] text-slate-400 hover:text-slate-200">
          ← Back to overview
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-surface-850">
        <div className="grid grid-cols-[1.4fr_1.4fr_.5fr_.5fr] gap-3 border-b border-white/[0.05] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          <span>Key</span>
          <span>Value</span>
          <span>Type</span>
          <span>Public</span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {settings.map((setting) => (
            <div key={setting.id} className="grid grid-cols-[1.4fr_1.4fr_.5fr_.5fr] items-center gap-3 px-5 py-3 text-[12px]">
              <span className="font-mono text-[11.5px] text-slate-300">{setting.key}</span>
              <span className="truncate text-slate-400">{setting.value}</span>
              <span className="text-[11px] text-slate-500">{setting.type}</span>
              <span className={setting.public ? "text-emerald-400" : "text-slate-600"}>{setting.public ? "Yes" : "No"}</span>
            </div>
          ))}
          {settings.length === 0 && (
            <p className="px-5 py-10 text-center text-[12.5px] text-slate-500">
              No settings found — run <code className="text-slate-300">npm run db:seed</code>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
