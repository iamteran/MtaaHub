import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { createListing } from "@/app/actions";
import { KENYAN_COUNTIES, PROPERTY_TYPES } from "@/lib/utils";

export const metadata: Metadata = { title: "List your property" };
export const dynamic = "force-dynamic";

const AMENITIES = ["Parking", "Borehole", "Security", "Lift", "Pool", "Gym", "Garden", "Wi-Fi", "Water tank", "Furnished", "Servant quarter", "CCTV"];

export default function ListPropertyPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="bg-ink-50/50 pb-16">
      <div className="container-main pt-6">
        <Link href="/nyumba" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-ink-900">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to homes
        </Link>
      </div>

      <div className="container-main mt-4 max-w-3xl">
        <div className="rounded-2xl border border-ink-100 bg-white p-6 sm:p-8">
          <p className="eyebrow">NyumbaHub</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink-900">List your property</h1>
          <p className="mt-1.5 text-[13.5px] text-ink-600">
            Free to list. Your phone number is shown only to people who open the listing.
          </p>

          {searchParams.error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[12.5px] text-red-700" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {searchParams.error}
            </div>
          )}

          <form action={createListing} className="mt-6 space-y-5">
            <div>
              <label htmlFor="title" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                Listing title
              </label>
              <input id="title" name="title" required placeholder="e.g. Cosy bedsitter in Kasarani" className="input-base" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="propertyType" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Property type
                </label>
                <select id="propertyType" name="propertyType" required defaultValue="Bedsitter" className="input-base">
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
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
              <div>
                <label htmlFor="estate" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Estate (optional)
                </label>
                <input id="estate" name="estate" placeholder="e.g. Mwiki" className="input-base" />
              </div>
              <div>
                <label htmlFor="rent" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Monthly rent (KSh)
                </label>
                <input id="rent" name="rent" type="number" min="1" required placeholder="8500" className="input-base" />
              </div>
              <div>
                <label htmlFor="deposit" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Deposit (KSh, optional)
                </label>
                <input id="deposit" name="deposit" type="number" min="0" placeholder="8500" className="input-base" />
              </div>
              <div>
                <label htmlFor="bedrooms" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Bedrooms
                </label>
                <input id="bedrooms" name="bedrooms" type="number" min="0" placeholder="1" className="input-base" />
              </div>
              <div>
                <label htmlFor="bathrooms" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Bathrooms
                </label>
                <input id="bathrooms" name="bathrooms" type="number" min="0" placeholder="1" className="input-base" />
              </div>
            </div>

            <div>
              <span className="mb-2 block text-[12.5px] font-semibold text-ink-800">Amenities</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {AMENITIES.map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-[12.5px] text-ink-700">
                    <input type="checkbox" name="amenities" value={amenity} className="h-3.5 w-3.5 rounded border-ink-300 text-primary-700" />
                    {amenity}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                minLength={20}
                rows={5}
                placeholder="Describe the home, the neighbourhood, water and security…"
                className="input-base resize-y"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="contactPhone" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Contact phone
                </label>
                <input id="contactPhone" name="contactPhone" required placeholder="0712 345 678" className="input-base" />
              </div>
              <div className="flex items-end gap-4 pb-2">
                <label className="flex items-center gap-2 text-[12.5px] text-ink-700">
                  <input type="checkbox" name="contactWhatsApp" defaultChecked className="h-3.5 w-3.5 rounded border-ink-300 text-primary-700" />
                  WhatsApp enabled
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary-700 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
            >
              Publish listing
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
