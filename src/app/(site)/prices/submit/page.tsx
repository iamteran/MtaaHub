import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { submitPrice } from "@/app/actions";
import { KENYAN_COUNTIES } from "@/lib/utils";

export const metadata: Metadata = { title: "Submit a price" };
export const dynamic = "force-dynamic";

const CATEGORIES = ["Food", "Construction", "Transport", "Energy", "Agriculture", "Household", "Services", "Other"];
const SOURCES = ["Shop", "Market", "Supermarket", "Fuel station", "Online", "Service provider"];

export default function SubmitPricePage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="bg-ink-50/50 pb-16">
      <div className="container-main pt-6">
        <Link href="/prices" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-ink-900">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to prices
        </Link>
      </div>

      <div className="container-main mt-4 max-w-2xl">
        <div className="rounded-2xl border border-ink-100 bg-white p-6 sm:p-8">
          <p className="eyebrow">BeiSmart</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink-900">Submit a price</h1>
          <p className="mt-1.5 text-[13.5px] text-ink-600">
            One price point helps your whole mtaa. Only submit prices you have actually seen.
          </p>

          {searchParams.error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[12.5px] text-red-700" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {searchParams.error}
            </div>
          )}

          <form action={submitPrice} className="mt-6 space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="itemName" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Item or service
                </label>
                <input id="itemName" name="itemName" required placeholder="e.g. Unga (2kg)" className="input-base" />
              </div>

              <div>
                <label htmlFor="brand" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Brand (optional)
                </label>
                <input id="brand" name="brand" placeholder="e.g. Jogoo" className="input-base" />
              </div>
              <div>
                <label htmlFor="unit" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Unit
                </label>
                <input id="unit" name="unit" required placeholder="e.g. 2kg packet" className="input-base" />
              </div>

              <div>
                <label htmlFor="price" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Price (KSh)
                </label>
                <input id="price" name="price" type="number" min="1" required placeholder="190" className="input-base" />
              </div>
              <div>
                <label htmlFor="category" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Category
                </label>
                <select id="category" name="category" defaultValue="Food" className="input-base">
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="county" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  County
                </label>
                <select id="county" name="county" required defaultValue="Nairobi" className="input-base">
                  {KENYAN_COUNTIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="town" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Town / area
                </label>
                <input id="town" name="town" placeholder="e.g. Kasarani" className="input-base" />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="source" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Where did you see this price?
                </label>
                <select id="source" name="source" defaultValue="Shop" className="input-base">
                  {SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="notes" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Notes (optional)
                </label>
                <textarea id="notes" name="notes" rows={3} placeholder="Anything else shoppers should know…" className="input-base resize-y" />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary-700 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
            >
              Submit price
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
