"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-full border border-ink-200 px-4 py-2 text-[12.5px] font-semibold text-ink-700 transition-colors hover:bg-ink-50"
      }
    >
      <LogOut className="h-3.5 w-3.5" /> Sign out
    </button>
  );
}
