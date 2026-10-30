import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
          <Compass className="h-8 w-8" />
        </span>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-700">Error 404</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-900">This page is not in this mtaa</h1>
        <p className="mt-3 text-[13.5px] text-ink-600">
          The link may be broken, or the listing might have been removed by its owner.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-800">
            <Home className="h-4 w-4" /> Back home
          </Link>
          <Link href="/nyumba" className="inline-flex items-center gap-2 rounded-full border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-800 hover:bg-ink-50">
            <Search className="h-4 w-4" /> Browse homes
          </Link>
        </div>
      </div>
    </div>
  );
}
