import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  CheckCircle2,
  MapPin,
  Phone,
  ShieldCheck,
  Heart,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { formatKSH, safeJsonParse, timeAgo } from "@/lib/utils";
import { toggleFavourite } from "@/app/actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const listing = await prisma.listing.findUnique({ where: { id: params.id }, select: { title: true, description: true } }).catch(() => null);
  if (!listing) return { title: "Listing not found" };
  return { title: listing.title, description: listing.description.slice(0, 150) };
}

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = await prisma.listing
    .findUnique({
      where: { id: params.id },
      include: {
        location: { select: { county: true, town: true, estate: true } },
        user: { select: { id: true, displayName: true, name: true } },
        verifications: { where: { status: "VERIFIED" }, select: { type: true, createdAt: true } },
      },
    })
    .catch(() => null);

  if (!listing) notFound();

  const amenities = safeJsonParse<string[]>(listing.amenities, []);
  const verified = listing.verifications.length > 0;
  const location = [listing.location?.estate, listing.location?.town, listing.location?.county].filter(Boolean).join(", ");
  const phone = listing.contactPhone.replace(/\s+/g, "");
  const whatsapp = `https://wa.me/${phone.replace(/^\+/, "").replace(/^0/, "254")}`;

  return (
    <div className="bg-ink-50/50 pb-16">
      <div className="container-main pt-6">
        <Link href="/nyumba" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-ink-900">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to homes
        </Link>
      </div>

      <div className="container-main mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div>
          <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-2xl border border-ink-100 bg-gradient-to-br from-emerald-200 via-emerald-100 to-teal-50 sm:h-80">
            <div className="absolute inset-0 bg-dots opacity-50" />
            <span className="relative rounded-xl bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-ink-700 shadow-sm backdrop-blur">
              {listing.propertyType}
            </span>
            {verified && (
              <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-primary-800 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified listing
              </span>
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-ink-100 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">{listing.title}</h1>
                <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-ink-500">
                  <MapPin className="h-4 w-4" /> {location || "Kenya"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold text-primary-700">{formatKSH(listing.rent)}</p>
                <p className="text-[11.5px] text-ink-500">per month</p>
                {listing.deposit ? <p className="mt-1 text-[11.5px] text-ink-500">Deposit {formatKSH(listing.deposit)}</p> : null}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {listing.bedrooms ? (
                <Spec icon={<BedDouble className="h-4 w-4" />} label={`${listing.bedrooms} bedroom${listing.bedrooms > 1 ? "s" : ""}`} />
              ) : null}
              {listing.bathrooms ? <Spec icon={<Bath className="h-4 w-4" />} label={`${listing.bathrooms} bathroom${listing.bathrooms > 1 ? "s" : ""}`} /> : null}
              <Spec icon={<ShieldCheck className="h-4 w-4" />} label={verified ? "Verified" : "Unverified"} />
            </div>

            <div className="mt-6">
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-500">About this home</h2>
              <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-ink-700">{listing.description}</p>
            </div>

            {amenities.length > 0 && (
              <div className="mt-6">
                <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-500">Amenities</h2>
                <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {amenities.map((amenity) => (
                    <li key={amenity} className="flex items-center gap-2 text-[13px] text-ink-700">
                      <CheckCircle2 className="h-4 w-4 text-primary-600" /> {amenity}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-6 text-[11.5px] text-ink-400">
              Listed {timeAgo(listing.createdAt)} · {listing.viewCount} views
            </p>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">Contact the owner</p>
            <p className="mt-2 font-semibold text-ink-900">
              {listing.user.displayName ?? listing.user.name ?? "MtaaHub member"}
            </p>

            <div className="mt-4 space-y-2.5">
              <a
                href={`tel:${phone}`}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-700 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
              >
                <Phone className="h-4 w-4" /> {listing.contactPhone}
              </a>
              {listing.contactWhatsApp && (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-ink-200 text-sm font-semibold text-ink-800 transition-colors hover:bg-ink-50"
                >
                  WhatsApp
                </a>
              )}
              <form action={toggleFavourite.bind(null, listing.id)}>
                <button
                  type="submit"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-ink-200 text-sm font-semibold text-ink-800 transition-colors hover:bg-ink-50"
                >
                  <Heart className="h-4 w-4" /> Save to favourites
                </button>
              </form>
            </div>

            <div className="mt-5 rounded-xl bg-amber-50 p-3 text-[11.5px] leading-relaxed text-amber-900 ring-1 ring-inset ring-amber-200">
              Never send a deposit before viewing the property and confirming ownership. Read our{" "}
              <Link href="/safety" className="font-semibold underline">
                safety guide
              </Link>
              .
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Spec({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-xl bg-ink-50 px-3 py-2 text-[12.5px] font-medium text-ink-700">
      <span className="text-ink-400">{icon}</span>
      {label}
    </span>
  );
}
