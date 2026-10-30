"use client";

import Link from "next/link";
import { Maximize2, X } from "lucide-react";

export function AdminTopbarActions() {
  const goFullscreen = () => {
    if (typeof document === "undefined") return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen?.();
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={goFullscreen}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-slate-200"
      >
        <Maximize2 className="h-3.5 w-3.5" />
        Fullscreen
      </button>
      <Link
        href="/"
        aria-label="Exit admin"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/[0.05] hover:text-slate-200"
      >
        <X className="h-4 w-4" />
      </Link>
    </div>
  );
}
