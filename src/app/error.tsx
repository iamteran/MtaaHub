"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-ink-100 bg-white p-8 text-center shadow-card">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertCircle className="h-7 w-7" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-extrabold text-ink-900">Something went wrong</h1>
        <p className="mt-2 text-[13.5px] text-ink-600">
          We hit an unexpected error while loading this page. Trying again usually fixes it.
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-700 text-sm font-semibold text-white hover:bg-primary-800"
          >
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-ink-200 text-sm font-semibold text-ink-800 hover:bg-ink-50"
          >
            <Home className="h-4 w-4" /> Back home
          </Link>
        </div>
        {error.digest && <p className="mt-4 text-[10.5px] text-ink-400">Reference: {error.digest}</p>}
      </div>
    </div>
  );
}
