import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  Home,
  MapPin,
  Scale,
  Scissors,
  Search,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  Wallet,
  Wrench,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatKSH, timeAgo, KENYAN_COUNTIES, PROPERTY_TYPES } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TABS = [
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/nyumba", label: "NyumbaHub", icon: Home, active: true },
  { href: "/services", label: "Services", icon: Wrench },
  { href: "/prices", label: "Price Compare", icon: Scale },
  { href: "/biashara", label: "Business Tools", icon: Store },
];

const QUICK_ACTIONS = [
  { href: "/jobs", icon: Briefcase, line1: "Find Jobs", line2: "Near You" },
  { href: "/safety", icon: ShieldCheck, line1: "Avoid Scams", line2: "Stay Safe" },
  { href: "/prices", icon: Scale, line1: "Compare Prices", line2: "Get the Best Deal" },
  { href: "/services", icon: Wrench, line1: "Book Local", line2: "Services" },
  { href: "/biashara", icon: Store, line1: "Grow Your", line2: "Small Business" },
  { href: "/ai", icon: Bot, line1: "Ask MtaaHub AI", line2: "Get Instant Help" },
];

const POPULAR_SERVICES = [
  {
    href: "/nyumba",
    label: "Houses for Rent",
    blurb: "Explore affordable homes near you",
    icon: Home,
    art: "from-emerald-100 via-emerald-50 to-white",
    tint: "text-emerald-700",
  },
  {
    href: "/services?category=Plumber",
    label: "Plumbing Services",
    blurb: "Get trusted plumbers",
    icon: Wrench,
    art: "from-sky-100 via-sky-50 to-white",
    tint: "text-sky-700",
  },
  {
    href: "/services?category=Repair Technician",
    label: "Phone & Laptop Repair",
    blurb: "Find experts nearby",
    icon: Smartphone,
    art: "from-violet-100 via-violet-50 to-white",
    tint: "text-violet-700",
  },
  {
    href: "/services?category=Cleaner",
    label: "Cleaning Services",
    blurb: "Book professional cleaners",
    icon: Sparkles,
    art: "from-amber-100 via-amber-50 to-white",
    tint: "text-amber-700",
  },
  {
    href: "/services?category=Tailor",
    label: "Tailoring Services",
    blurb: "Find skilled tailors",
    icon: Scissors,
    art: "from-rose-100 via-rose-50 to-white",
    tint: "text-rose-700",
  },
];

type HomeJob = {
  id: string;
  title: string;
  companyName: string | null;
  county: string;
  town: string | null;
  createdAt: Date;
};

async function getHomeData() {
  try {
    const [jobs, serviceCount, listingCount] = await Promise.all([
      prisma.jobPost.findMany({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, title: true, companyName: true, county: true, town: true, createdAt: true },
      }),
      prisma.serviceProvider.count({ where: { verificationStatus: "VERIFIED" } }),
      prisma.listing.count({ where: { status: "ACTIVE" } }),
    ]);
    return { jobs, serviceCount, listingCount };
  } catch {
    return { jobs: [] as HomeJob[], serviceCount: 0, listingCount: 0 };
  }
}

export default async function HomePage() {
  const { jobs } = await getHomeData();

  return (
    <div className="flex flex-col">
      {/* ---------------------------------------------------------------- hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-nairobi.jpg"
            alt="Nairobi skyline"
            className="h-full w-full object-cover object-[50%_62%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/35 to-white/0" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />
        </div>

        <div className="container-main relative flex min-h-[540px] flex-col justify-center pb-40 pt-14 sm:pt-16 lg:pb-44">
          <div className="max-w-2xl">
            <h1 className="font-display text-[44px] font-extrabold leading-[1.02] tracking-[-0.035em] text-ink-900 sm:text-6xl lg:text-[70px]">
              Your Mtaa. <span className="text-primary-700">Our Hub.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-700 sm:text-xl">
              Find jobs, homes, trusted services, and more — all in one place!
            </p>
            <div className="mt-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-700 px-4 py-2 text-sm font-semibold text-white shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-200" aria-hidden="true" />
                Free for everyone
              </span>
            </div>
          </div>

          {/* handwritten flourish */}
          <div className="pointer-events-none absolute right-6 top-10 hidden rotate-[-4deg] select-none lg:block">
            <svg width="230" height="92" viewBox="0 0 230 92" fill="none" aria-hidden="true">
              <text
                x="4"
                y="34"
                fill="#131C29"
                fontSize="25"
                fontStyle="italic"
                fontFamily="'Segoe Script','Brush Script MT','Lucida Handwriting',cursive"
              >
                A smarter, safer
              </text>
              <text
                x="18"
                y="66"
                fill="#131C29"
                fontSize="25"
                fontStyle="italic"
                fontFamily="'Segoe Script','Brush Script MT','Lucida Handwriting',cursive"
              >
                Kenya together
              </text>
              <path d="M8 78c46 9 128 9 176-1" stroke="#F4A62A" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- search panel */}
      <div className="container-main relative z-20 -mt-32 sm:-mt-36">
        <div className="rounded-[22px] border border-ink-100 bg-white p-2 shadow-hero">
          <div className="flex items-stretch gap-1 overflow-x-auto px-1 pt-1 no-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={[
                    "flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                    tab.active
                      ? "bg-primary-50 text-primary-800 ring-1 ring-primary-100"
                      : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
                  ].join(" ")}
                >
                  <Icon className={["h-[18px] w-[18px]", tab.active ? "text-primary-700" : "text-ink-400"].join(" ")} />
                  {tab.label}
                </Link>
              );
            })}
          </div>

          <form
            action="/nyumba"
            method="get"
            className="mt-2 grid grid-cols-1 gap-2 border-t border-ink-100 p-2 md:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1.1fr_1fr_auto]"
          >
            <Field icon={<MapPin className="h-4 w-4" />} label="Location">
              <select name="county" defaultValue="Nairobi" className="peer w-full appearance-none bg-transparent pr-6 text-sm font-medium text-ink-900 focus:outline-none">
                {KENYAN_COUNTIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <Field icon={<Home className="h-4 w-4" />} label="Property type">
              <select name="propertyType" defaultValue="Bedsitter" className="w-full appearance-none bg-transparent pr-6 text-sm font-medium text-ink-900 focus:outline-none">
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>

            <Field icon={<Wallet className="h-4 w-4" />} label="Max rent">
              <select name="maxRent" defaultValue="8000" className="w-full appearance-none bg-transparent pr-6 text-sm font-medium text-ink-900 focus:outline-none">
                {[5000, 8000, 15000, 25000, 40000, 70000, 150000].map((v) => (
                  <option key={v} value={v}>
                    Max Rent: {formatKSH(v)}
                  </option>
                ))}
              </select>
            </Field>

            <Field icon={<Shield className="h-4 w-4" />} label="Verification">
              <select name="verified" defaultValue="1" className="w-full appearance-none bg-transparent pr-6 text-sm font-medium text-ink-900 focus:outline-none">
                <option value="1">Verified Only</option>
                <option value="">Show all listings</option>
              </select>
            </Field>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-700 px-7 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-800"
            >
              Search Homes
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* ------------------------------------------------------ quick actions */}
      <section className="container-main mt-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group flex flex-col items-center gap-2.5 rounded-2xl border border-ink-100 bg-white px-3 py-5 text-center shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-float"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary-100">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-[13.5px] font-semibold leading-snug text-ink-800">
                  {action.line1}
                  <br />
                  <span className="font-medium text-ink-600">{action.line2}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------- popular services */}
      <section className="container-main mt-12">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-[28px]">
            Popular Services
          </h2>
          <Link href="/services" className="hidden items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800 sm:inline-flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {POPULAR_SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.label}
                href={service.href}
                className="group overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-float"
              >
                <div className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${service.art}`}>
                  <div className="absolute inset-0 bg-dots opacity-40" />
                  <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/85 shadow-sm ring-1 ring-white/60 backdrop-blur-sm">
                    <Icon className={`h-8 w-8 ${service.tint}`} />
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold leading-tight text-ink-900">{service.label}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
                    {service.blurb}
                    <ArrowRight className="h-3.5 w-3.5 text-primary-600 transition-transform group-hover:translate-x-0.5" />
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------ 3 columns */}
      <section className="container-main mt-10 pb-16">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.02fr_1fr_1fr]">
          {/* safety */}
          <div className="relative overflow-hidden rounded-2xl border border-primary-100 bg-primary-50 p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-700 text-white">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold leading-snug text-ink-900">Stay Safe with MtaaHub</h3>
                <p className="mt-1 text-sm text-ink-600">Verify before you pay. Every listing can be reported.</p>
              </div>
            </div>

            <ul className="mt-5 space-y-2.5 text-sm text-ink-700">
              {["Verified Listings & Services", "Report Suspicious Activity", "Real User Reviews"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-700" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/safety"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
            >
              Learn More <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* latest jobs */}
          <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-ink-900">Latest Jobs</h3>
              <Link href="/jobs" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-4 divide-y divide-ink-100">
              {jobs.length === 0 && (
                <p className="py-6 text-sm text-ink-500">
                  No jobs posted yet — <Link href="/jobs/post" className="font-semibold text-primary-700">post the first one</Link>.
                </p>
              )}
              {jobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-500 group-hover:bg-primary-50 group-hover:text-primary-700">
                    <Briefcase className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink-900 group-hover:text-primary-800">
                      {job.title}
                    </span>
                    <span className="block truncate text-xs text-ink-500">
                      {job.companyName || "Private employer"} – {job.town || job.county}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-ink-400">
                    <Clock className="h-3 w-3" />
                    {timeAgo(job.createdAt)}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* compare prices */}
          <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
            <div className="relative h-28 w-full overflow-hidden bg-primary-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/market.jpg" alt="Fresh produce at a Kenyan market" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/70 to-transparent" />
            </div>
            <div className="p-6">
              <h3 className="font-display text-lg font-bold leading-snug text-ink-900">Compare Prices, Save More!</h3>
              <p className="mt-1.5 text-sm text-ink-600">
                Check prices for essential items across different shops in your neighbourhood.
              </p>
              <Link
                href="/prices"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
              >
                Compare Now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="relative flex h-12 items-center gap-2 rounded-xl border border-ink-200 px-3 transition-colors focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20">
      <span className="text-ink-400" aria-hidden="true">
        {icon}
      </span>
      <span className="sr-only">{label}</span>
      {children}
      <ChevronDown className="pointer-events-none absolute right-2.5 h-4 w-4 text-ink-400" aria-hidden="true" />
    </label>
  );
}
