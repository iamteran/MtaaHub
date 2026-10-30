import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Search, Store, Wrench } from "lucide-react";
import prisma from "@/lib/prisma";
import { ServiceCard, type ServiceCardData } from "@/components/site/service-card";
import { KENYAN_COUNTIES, SERVICE_CATEGORIES } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mtaani — Local services",
  description: "Find verified electricians, plumbers, cleaners, mechanics and more in your neighbourhood.",
};

type Params = { category?: string; county?: string };

export default async function ServicesPage({ searchParams }: { searchParams: Params }) {
  const { category, county } = searchParams;

  const where: Record<string, unknown> = { verificationStatus: "VERIFIED" };
  if (category) where.category = category;
  if (county) where.location = { county };

  const services = await prisma.serviceProvider
    .findMany({
      where,
      orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
      take: 24,
      include: { location: { select: { county: true, town: true, estate: true } } },
    })
    .catch(() => []);

  const total = await prisma.serviceProvider.count({ where }).catch(() => 0);
  const activeFilters = [category, county].filter(Boolean).length;

  return (
    <div className="bg-ink-50/50">
      <section className="border-b border-ink-100 bg-white">
        <div className="container-main py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Mtaani</p>
              <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
                Trusted pros in your mtaa
              </h1>
              <p className="mt-2 max-w-xl text-[15px] text-ink-600">
                {total > 0
                  ? `${total} verified service providers ready to work.`
                  : "No providers listed yet — register your service free."}
              </p>
            </div>
            <Link
              href="/services/register"
              className="inline-flex items-center gap-2 rounded-full bg-primary-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
            >
              <Plus className="h-4 w-4" /> Register your service
            </Link>
          </div>
        </div>
      </section>

      <div className="container-main -mt-5">
        <form action="/services" method="get" className="rounded-2xl border border-ink-100 bg-white p-3 shadow-card">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <select name="category" defaultValue={category ?? ""} className="input-base h-11 py-0" aria-label="Category">
              <option value="">Any category</option>
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select name="county" defaultValue={county ?? ""} className="input-base h-11 py-0" aria-label="County">
              <option value="">All counties</option>
              {KENYAN_COUNTIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
            >
              <Search className="h-4 w-4" /> Search services
            </button>

            {activeFilters > 0 && (
              <Link
                href="/services"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-ink-200 text-sm font-semibold text-ink-700 hover:bg-ink-50"
              >
                Clear filters
              </Link>
            )}
          </div>
        </form>
      </div>

      <section className="container-main py-10">
        {services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
              <Wrench className="h-7 w-7" />
            </span>
            <h2 className="mt-4 font-display text-xl font-bold text-ink-900">No providers here yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-600">
              Providers appear once an admin verifies their profile. Know a good fundi? Ask them to register.
            </p>
            <Link
              href="/services/register"
              className="mt-6 inline-flex rounded-full bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
            >
              Register a service
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service as unknown as ServiceCardData} />
            ))}
          </div>
        )}
      </section>

      <section className="container-main pb-14">
        <div className="rounded-2xl border border-primary-100 bg-primary-50 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-700 text-white">
                <Store className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-ink-900">Offer a service? Get listed free.</h2>
                <p className="mt-1 max-w-lg text-sm text-ink-600">
                  Plumbers, electricians, cleaners, tailors and repair techs can register their business and appear in search.
                </p>
              </div>
            </div>
            <Link
              href="/services/register"
              className="rounded-full bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
            >
              Register now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
