import Link from "next/link";
import { MapPin, Star, ShieldCheck } from "lucide-react";
import { initials } from "@/lib/utils";

export type ServiceCardData = {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  description: string;
  pricing: string | null;
  rating: number;
  reviewCount: number;
  verificationStatus: string;
  location: { county: string; town: string | null; estate: string | null } | null;
};

export function ServiceCard({ service }: { service: ServiceCardData }) {
  return (
    <Link
      href={`/services/${service.id}`}
      className="group flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-float"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-[14px] font-bold text-primary-800">
          {initials(service.name)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 text-[15px] font-semibold text-ink-900 group-hover:text-primary-800">{service.name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-[12px] text-ink-500">
            <MapPin className="h-3 w-3" />
            {[service.location?.town, service.location?.county].filter(Boolean).join(", ") || "Kenya"}
          </p>
        </div>
        {service.verificationStatus === "VERIFIED" && (
          <ShieldCheck className="h-4 w-4 shrink-0 text-primary-600" aria-label="Verified provider" />
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-primary-50 px-2 py-1 text-[10.5px] font-semibold text-primary-800">{service.category}</span>
        {service.subcategory && (
          <span className="rounded-md bg-ink-50 px-2 py-1 text-[10.5px] font-medium text-ink-600">{service.subcategory}</span>
        )}
      </div>

      <p className="mt-3 line-clamp-2 text-[12.5px] leading-relaxed text-ink-600">{service.description}</p>

      <div className="mt-auto flex items-center justify-between border-t border-ink-100 pt-3">
        <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ink-800">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          {service.rating > 0 ? service.rating.toFixed(1) : "New"}
          {service.reviewCount > 0 && <span className="text-[10.5px] font-normal text-ink-400">({service.reviewCount})</span>}
        </span>
        {service.pricing && <span className="text-[11.5px] font-medium text-primary-700">{service.pricing}</span>}
      </div>
    </Link>
  );
}
