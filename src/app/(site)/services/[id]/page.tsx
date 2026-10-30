import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Clock, MapPin, MessageCircle, Phone, ShieldCheck, Star } from "lucide-react";
import prisma from "@/lib/prisma";
import { safeJsonParse } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const service = await prisma.serviceProvider.findUnique({ where: { id: params.id }, select: { name: true, description: true } }).catch(() => null);
  if (!service) return { title: "Service not found" };
  return { title: service.name, description: service.description.slice(0, 150) };
}

export default async function ServiceDetailPage({ params }: { params: { id: string } }) {
  const service = await prisma.serviceProvider
    .findUnique({
      where: { id: params.id },
      include: {
        location: { select: { county: true, town: true, estate: true } },
        user: { select: { displayName: true, name: true } },
        _count: { select: { verifications: true } },
      },
    })
    .catch(() => null);

  if (!service) notFound();

  const areas = safeJsonParse<string[]>(service.areasServed, []);
  const verified = service.verificationStatus === "VERIFIED";
  const phone = service.phone.replace(/\s+/g, "");
  const whatsapp = `https://wa.me/${phone.replace(/^\+/, "").replace(/^0/, "254")}`;
  const location = [service.location?.town, service.location?.county].filter(Boolean).join(", ");

  return (
    <div className="bg-ink-50/50 pb-16">
      <div className="container-main pt-6">
        <Link href="/services" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-ink-900">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to services
        </Link>
      </div>

      <div className="container-main mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr]">
        <article className="rounded-2xl border border-ink-100 bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-lg font-bold text-primary-800">
              {service.name.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="flex flex-wrap items-center gap-2 font-display text-2xl font-extrabold tracking-tight text-ink-900">
                {service.name}
                {verified && <BadgeCheck className="h-5 w-5 text-primary-600" aria-label="Verified" />}
              </h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-500">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {location || "Kenya"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {service.rating > 0 ? service.rating.toFixed(1) : "New"} ({service.reviewCount} reviews)
                </span>
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-lg bg-primary-50 px-3 py-1.5 text-[11.5px] font-semibold text-primary-800">{service.category}</span>
            {service.subcategory && <span className="rounded-lg bg-ink-50 px-3 py-1.5 text-[11.5px] font-medium text-ink-700">{service.subcategory}</span>}
            {service.pricing && <span className="rounded-lg bg-ink-50 px-3 py-1.5 text-[11.5px] font-medium text-ink-700">{service.pricing}</span>}
          </div>

          <section className="mt-7">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-500">About this service</h2>
            <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-ink-700">{service.description}</p>
          </section>

          {areas.length > 0 && (
            <section className="mt-6">
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-500">Areas served</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {areas.map((area) => (
                  <span key={area} className="rounded-lg bg-ink-50 px-2.5 py-1.5 text-[12px] text-ink-700">
                    {area}
                  </span>
                ))}
              </div>
            </section>
          )}

          {service.businessHours && (
            <section className="mt-6 flex items-start gap-2 text-[13px] text-ink-700">
              <Clock className="mt-0.5 h-4 w-4 text-ink-400" />
              {service.businessHours}
            </section>
          )}

          <p className="mt-8 text-[11.5px] text-ink-400">
            {service.viewCount} profile views · {service._count.verifications} verification checks
          </p>
        </article>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">Get in touch</p>
            <div className="mt-3 space-y-2.5">
              <a
                href={`tel:${phone}`}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-700 text-sm font-semibold text-white hover:bg-primary-800"
              >
                <Phone className="h-4 w-4" /> {service.phone}
              </a>
              {service.whatsapp && (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-ink-200 text-sm font-semibold text-ink-800 hover:bg-ink-50"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              )}
              {service.email && (
                <a
                  href={`mailto:${service.email}`}
                  className="flex h-11 items-center justify-center rounded-xl border border-ink-200 text-sm font-semibold text-ink-800 hover:bg-ink-50"
                >
                  Email
                </a>
              )}
            </div>

            <div className="mt-5 flex items-start gap-2 rounded-xl bg-primary-50 p-3 text-[11.5px] leading-relaxed text-primary-900">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              {verified
                ? "This provider's identity and contact details were verified by the MtaaHub team."
                : "This provider has not completed verification yet. Agree on scope and price before work starts."}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
