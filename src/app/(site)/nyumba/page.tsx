import type { Metadata } from "next";
import Link from "next/link";
import { Home, Plus, Search, SlidersHorizontal } from "lucide-react";
import prisma from "@/lib/prisma";
import { ListingCard, type ListingCardData } from "@/components/site/listing-card";
import { KENYAN_COUNTIES, PROPERTY_TYPES } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "NyumbaHub — Find your home",
  description: "Browse verified rentals across Kenya. Filter by county, property type and budget.",
};

type Params = {
  county?: string;
  propertyType?: string;
  maxRent?: string;
  minRent?: string;
  verified?: string;
};

export default async function NyumbaPage({ searchParams }: { searchParams: Params }) {
  const { county, propertyType, maxRent, minRent, verified } = searchParams;

  const where: Record<string, unknown> = { status: "ACTIVE" };
  if (county) where.location = { county };
  if (propertyType) where.propertyType = propertyType;
  if (maxRent) where.rent = { ...(where.rent as object), lte: Number(maxRent) };
  if (minRent) where.rent = { ...(where.rent as object), gte: Number(minRent) };
  if (verified === "1") where.verifications = { some: { status: "VERIFIED" } };

  const listings = await prisma.listing
    .findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 24,
      include: {
        location: { select: { county: true, town: true, estate: true } },
        verifications: { select: { status: true } },
      },
    })
    .catch(() => []);

  const total = await prisma.listing.count({ where }).catch(() => 0);
  const activeFilters = [county, propertyType, maxRent, verified].filter(Boolean).length;

  return (
    <div className="bg-ink-50/50">
      <section className="border-b border-ink-100 bg-white">
        <div className="container-main py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">NyumbaHub</p>
              <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
                Find your next home
              </h1>
              <p className="mt-2 max-w-xl text-[15px] text-ink-600">
                {total > 0
                  ? `${total} verified and community listings across Kenya.`
                  : "No listings in this area yet — be the first to list."}
              </p>
            </div>
            <Link
              href="/nyumba/list"
              className="inline-flex items-center gap-2 rounded-full bg-primary-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
            >
              <Plus className="h-4 w-4" /> List your property
            </Link>
          </div>
        </div>
      </section>

      <div className="container-main -mt-5">
        <form className="rounded-2xl border border-ink-100 bg-white p-3 shadow-card" action="/nyumba" method="get">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <select name="county" defaultValue={county ?? ""} className="input-base h-11 py-0" aria-label="County">
              <option value="">All counties</option>
              {KENYAN_COUNTIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select name="propertyType" defaultValue={propertyType ?? ""} className="input-base h-11 py-0" aria-label="Property type">
              <option value="">Any property type</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select name="maxRent" defaultValue={maxRent ?? ""} className="input-base h-11 py-0" aria-label="Maximum rent">
              <option value="">Any budget</option>
              {[5000, 10000, 20000, 35000, 50000, 100000].map((v) => (
                <option key={v} value={v}>
                  Up to KSh {v.toLocaleString()}
                </option>
              ))}
            </select>

            <select name="verified" defaultValue={verified ?? ""} className="input-base h-11 py-0" aria-label="Verification">
              <option value="">Any listing</option>
              <option value="1">Verified only</option>
            </select>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
            >
              <Search className="h-4 w-4" /> Search
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between px-1 text-[11.5px] text-ink-500">
            <span className="inline-flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {activeFilters > 0 ? `${activeFilters} filter${activeFilters > 1 ? "s" : ""} applied` : "Showing everything"}
            </span>
            {activeFilters > 0 && (
              <Link href="/nyumba" className="font-medium text-primary-700 hover:underline">
                Clear filters
              </Link>
            )}
          </div>
        </form>
      </div>

      <section className="container-main py-10">
        {listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
              <Home className="h-7 w-7" />
            </span>
            <h2 className="mt-4 font-display text-xl font-bold text-ink-900">No homes match those filters</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-600">
              Try widening your budget or removing a filter. New listings are added by landlords and agents every day.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/nyumba" className="rounded-full border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-800 hover:bg-ink-50">
                Clear filters
              </Link>
              <Link href="/nyumba/list" className="rounded-full bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-800">
                List a property
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing as unknown as ListingCardData}
                verified={listing.verifications.some((v) => v.status === "VERIFIED")}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
