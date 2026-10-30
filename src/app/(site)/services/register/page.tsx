import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { createService } from "@/app/actions";
import { KENYAN_COUNTIES, SERVICE_CATEGORIES } from "@/lib/utils";

export const metadata: Metadata = { title: "Register your service" };
export const dynamic = "force-dynamic";

const AREAS = ["Nairobi", "Kiambu", "Mombasa", "Nakuru", "Kisumu", "Machakos", "Kajiado"];

export default function RegisterServicePage({ searchParams }: { searchParams: { error?: string; submitted?: string } }) {
  if (searchParams.submitted) {
    return (
      <div className="bg-ink-50/50 pb-16">
        <div className="container-main mt-10 max-w-xl">
          <div className="rounded-2xl border border-ink-100 bg-white p-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-700">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h1 className="mt-4 font-display text-2xl font-extrabold text-ink-900">Profile submitted</h1>
            <p className="mt-2 text-[13.5px] text-ink-600">
              Our team reviews new providers before they appear in search. You will get a notification once verified.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/services" className="rounded-full border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-800 hover:bg-ink-50">
                Browse services
              </Link>
              <Link href="/dashboard" className="rounded-full bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-800">
                Go to dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ink-50/50 pb-16">
      <div className="container-main pt-6">
        <Link href="/services" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-ink-900">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to services
        </Link>
      </div>

      <div className="container-main mt-4 max-w-3xl">
        <div className="rounded-2xl border border-ink-100 bg-white p-6 sm:p-8">
          <p className="eyebrow">Mtaani</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink-900">Register your service</h1>
          <p className="mt-1.5 text-[13.5px] text-ink-600">
            Free listing for verified fundis and small businesses. Admin review usually takes under 48 hours.
          </p>

          {searchParams.error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[12.5px] text-red-700" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {searchParams.error}
            </div>
          )}

          <form action={createService} className="mt-6 space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Business or service name
                </label>
                <input id="name" name="name" required placeholder="e.g. Mwangi Plumbing Works" className="input-base" />
              </div>
              <div>
                <label htmlFor="category" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Category
                </label>
                <select id="category" name="category" required defaultValue="Plumber" className="input-base">
                  {SERVICE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="subcategory" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Speciality (optional)
                </label>
                <input id="subcategory" name="subcategory" placeholder="e.g. Leak repairs" className="input-base" />
              </div>
              <div>
                <label htmlFor="pricing" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Pricing guide (optional)
                </label>
                <input id="pricing" name="pricing" placeholder="e.g. From KSh 2,000 per job" className="input-base" />
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
                <input id="town" name="town" placeholder="e.g. Kilimani" className="input-base" />
              </div>

              <div>
                <label htmlFor="phone" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Phone (shown to customers)
                </label>
                <input id="phone" name="phone" required placeholder="0712 345 678" className="input-base" />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Email (optional)
                </label>
                <input id="email" name="email" type="email" placeholder="you@example.com" className="input-base" />
              </div>
            </div>

            <div>
              <span className="mb-2 block text-[12.5px] font-semibold text-ink-800">Areas served</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {AREAS.map((area) => (
                  <label key={area} className="flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-[12.5px] text-ink-700">
                    <input type="checkbox" name="areas" value={area} className="h-3.5 w-3.5 rounded border-ink-300 text-primary-700" />
                    {area}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="businessHours" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                Business hours (optional)
              </label>
              <input id="businessHours" name="businessHours" placeholder="e.g. Mon–Sat, 8am–6pm" className="input-base" />
            </div>

            <div>
              <label htmlFor="description" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                Describe your service
              </label>
              <textarea
                id="description"
                name="description"
                required
                minLength={20}
                rows={4}
                placeholder="What do you do, how long have you worked, and what makes you reliable?"
                className="input-base resize-y"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary-700 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
            >
              Submit for verification
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
