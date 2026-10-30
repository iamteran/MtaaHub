"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Users,
  AlertTriangle,
  ShieldCheck,
  MessagesSquare,
  Settings,
  HelpCircle,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/reports", label: "Escalations", icon: AlertTriangle },
  { href: "/admin/verifications", label: "Verifications", icon: ShieldCheck },
  { href: "/admin/community", label: "Community", icon: MessagesSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AdminSidebar({ counts }: { counts?: { reports?: number } }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[244px] flex-col border-r border-white/[0.06] bg-surface-900">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 ring-1 ring-inset ring-blue-400/30">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 3 4.5 7v10L12 21l7.5-4V7L12 3Z" strokeLinejoin="round" />
            <path d="m8.5 14.5 3.5-6 3.5 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div className="leading-tight">
          <p className="text-[15px] font-semibold text-slate-100">MtaaHub</p>
          <p className="text-[11px] text-slate-500">Admin console</p>
        </div>
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400" aria-hidden="true" />
      </div>

      <nav className="mt-1 flex flex-col gap-1 px-3" aria-label="Admin sections">
        {NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          const Icon = item.icon;
          const count = item.href === "/admin/reports" ? counts?.reports : undefined;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors",
                active
                  ? "bg-blue-500/10 text-slate-100 ring-1 ring-inset ring-blue-400/20"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
              )}
            >
              {active && <span className="absolute inset-y-2 left-0 w-[2px] rounded-full bg-blue-400" />}
              <Icon className={cn("h-[18px] w-[18px]", active ? "text-blue-400" : "text-slate-500 group-hover:text-slate-400")} />
              <span className="flex-1">{item.label}</span>
              {count ? (
                <span className="rounded-full bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-blue-300">
                  {count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 px-3 pb-4">
        <div className="rounded-xl bg-white/[0.03] p-3 ring-1 ring-inset ring-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <p className="text-[12px] font-medium text-slate-200">System operational</p>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">All systems running normally</p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-[12.5px] text-slate-500 transition-colors hover:bg-white/[0.04] hover:text-slate-300"
        >
          <HelpCircle className="h-4 w-4" />
          Back to MtaaHub
        </Link>
        <div className="flex items-center gap-1.5 px-3 text-[10.5px] text-slate-600">
          <Activity className="h-3 w-3" />
          v1.0 · Nairobi region
        </div>
      </div>
    </aside>
  );
}
