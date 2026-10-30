import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Plus, Search, TrendingUp } from "lucide-react";
import prisma from "@/lib/prisma";
import { formatKSH, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "BeiSmart — Compare prices",
  description: "Community-sourced prices for food, transport, materials and services across Kenya.",
};

type Params = { category?: string; county?: string };

export default async function PricesPage({ searchParams }: { searchParams: Params }) {
  const { category, county } = searchParams;

  const where: Record<string, unknown> = { status: "ACTIVE" };
  if (category) where.category = category;
  if (county) where.county = county;

  const prices = await prisma.priceSubmission
    .findMany({
      where,
      orderBy: { submittedAt: "desc" },
      take: 60,
      include: { submittedBy: { select: { displayName: true, name: true } } },
    })
    .catch(() => []);

  const categories = [...new Set(prices.map((p) => p.category))].sort();
  const countries = [...new Set(prices.map((p) => p.county))].sort();
  const verifiedCount = prices.filter((p) => p.isVerified).length;

  return (
    <div className="bg-ink-50/50">
      <section className="border-b border-ink-100 bg-white">
        <div className="container-main py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">BeiSmart</p>
              <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
                Know the price before you buy
              </h1>
              <p className="mt-2 max-w-xl text-[15px] text-ink-600">
                {prices.length} community price points · {verifiedCount} verified by our team.
              </p>
            </div>
            <Link
              href="/prices/submit"
              className="inline-flex items-center gap-2 rounded-full bg-primary-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
            >
              <Plus className="h-4 w-4" /> Submit a price
            </Link>
          </div>
        </div>
      </section>

      <div className="container-main -mt-5">
        <form action="/prices" method="get" className="rounded-2xl border border-ink-100 bg-white p-3 shadow-card">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <select name="category" defaultValue={category ?? ""} className="input-base h-11 py-0" aria-label="Category">
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select name="county" defaultValue={county ?? ""} className="input-base h-11 py-0" aria-label="County">
              <option value="">All counties</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
            >
              <Search className="h-4 w-4" /> Filter
            </button>

            {(category || county) && (
              <Link href="/prices" className="inline-flex h-11 items-center justify-center rounded-xl border border-ink-200 text-sm font-semibold text-ink-700 hover:bg-ink-50">
                Clear
              </Link>
            )}
          </div>
        </form>
      </div>

      <section className="container-main py-10">
        {prices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center">
            <TrendingUp className="mx-auto h-10 w-10 text-primary-500" />
            <h2 className="mt-4 font-display text-xl font-bold text-ink-900">No prices submitted yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-600">
              Help your mtaa by sharing what you paid for unga, cement, petrol or a service.
            </p>
            <Link href="/prices/submit" className="mt-6 inline-flex rounded-full bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-800">
              Submit the first price
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
            <div className="hidden grid-cols-[1.6fr_.8fr_.8fr_.8fr_.8fr] gap-3 border-b border-ink-100 bg-ink-50/60 px-5 py-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-500 md:grid">
              <span>Item</span>
              <span>Category</span>
              <span>Unit</span>
              <span>Location</span>
              <span className="text-right">Price</span>
            </div>

            <div className="divide-y divide-ink-100">
              {prices.map((price) => (
                <div key={price.id} className="grid grid-cols-2 gap-3 px-5 py-4 md:grid-cols-[1.6fr_.8fr_.8fr_.8fr_.8fr] md:items-center">
                  <div className="col-span-2 md:col-span-1">
                    <p className="flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-900">
                      {price.itemName}
                      {price.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-primary-600" aria-label="Verified price" />}
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink-500">
                      {price.brand ? `${price.brand} · ` : ""}
                      {timeAgo(price.submittedAt)} · by {price.submittedBy.displayName ?? price.submittedBy.name ?? "a neighbour"}
                    </p>
                  </div>
                  <span className="text-[12px] text-ink-600">{price.category}</span>
                  <span className="text-[12px] text-ink-600">{price.unit}</span>
                  <span className="text-[12px] text-ink-600">{[price.town, price.county].filter(Boolean).join(", ")}</span>
                  <span className="text-right text-[15px] font-bold text-primary-700">{formatKSH(price.price)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
