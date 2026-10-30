import Link from "next/link";
import { BedDouble, Bath, MapPin, Heart, ShieldCheck } from "lucide-react";
import { formatKSH, safeJsonParse, timeAgo } from "@/lib/utils";

export type ListingCardData = {
  id: string;
  title: string;
  propertyType: string;
  rent: number;
  bedrooms: number | null;
  bathrooms: number | null;
  amenities: string;
  favouriteCount: number;
  createdAt: Date;
  location: { county: string; town: string | null; estate: string | null } | null;
};

const GRADIENTS = [
  "from-emerald-200 via-emerald-100 to-teal-50",
  "from-sky-200 via-sky-100 to-blue-50",
  "from-amber-200 via-amber-100 to-orange-50",
  "from-violet-200 via-violet-100 to-fuchsia-50",
  "from-rose-200 via-rose-100 to-pink-50",
];

export function ListingCard({ listing, verified = false }: { listing: ListingCardData; verified?: boolean }) {
  const gradient = GRADIENTS[listing.id.charCodeAt(listing.id.length - 1) % GRADIENTS.length];
  const amenities = safeJsonParse<string[]>(listing.amenities, []).slice(0, 3);

  return (
    <Link
      href={`/nyumba/${listing.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-float"
    >
      <div className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${gradient}`}>
        <div className="absolute inset-0 bg-dots opacity-50" />
        <span className="relative rounded-xl bg-white/70 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-ink-700 shadow-sm backdrop-blur">
          {listing.propertyType}
        </span>
        {verified && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-primary-800 shadow-sm">
            <ShieldCheck className="h-3 w-3" /> Verified
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-[15px] font-semibold text-ink-900 group-hover:text-primary-800">{listing.title}</h3>
          <span className="shrink-0 text-[15px] font-bold text-primary-700">{formatKSH(listing.rent)}</span>
        </div>

        <p className="mt-1 flex items-center gap-1 text-[12.5px] text-ink-500">
          <MapPin className="h-3.5 w-3.5" />
          {[listing.location?.estate, listing.location?.town, listing.location?.county].filter(Boolean).join(", ") || "Kenya"}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-ink-600">
          {listing.bedrooms ? (
            <span className="inline-flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5 text-ink-400" /> {listing.bedrooms} bed
            </span>
          ) : null}
          {listing.bathrooms ? (
            <span className="inline-flex items-center gap-1">
              <Bath className="h-3.5 w-3.5 text-ink-400" /> {listing.bathrooms} bath
            </span>
          ) : null}
          <span className="ml-auto inline-flex items-center gap-1 text-ink-400">
            <Heart className="h-3.5 w-3.5" /> {listing.favouriteCount}
          </span>
        </div>

        {amenities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {amenities.map((a) => (
              <span key={a} className="rounded-md bg-ink-50 px-2 py-1 text-[10.5px] font-medium text-ink-600">
                {a}
              </span>
            ))}
          </div>
        )}

        <p className="mt-auto pt-3 text-[10.5px] text-ink-400">Listed {timeAgo(listing.createdAt)}</p>
      </div>
    </Link>
  );
}
