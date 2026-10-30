import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Briefcase, Heart, Home, Plus, Store, Wrench } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatKSH, initials, timeAgo, titleCase } from "@/lib/utils";
import { SignOutButton } from "@/components/site/sign-out-button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard" };

const TABS = [
  { key: "listings", label: "My listings", icon: Home },
  { key: "favourites", label: "Saved", icon: Heart },
  { key: "applications", label: "Applications", icon: Briefcase },
  { key: "services", label: "My service", icon: Wrench },
] as const;

export default async function DashboardPage({ searchParams }: { searchParams: { tab?: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/dashboard");

  const userId = session.user.id;
  const tab = (TABS.find((t) => t.key === searchParams.tab)?.key ?? "listings") as (typeof TABS)[number]["key"];

  const [user, listings, favourites, applications, service] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { displayName: true, name: true, email: true, role: true, createdAt: true } }).catch(() => null),
    prisma.listing
      .findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { location: { select: { county: true, town: true, estate: true } } },
      })
      .catch(() => []),
    prisma.favourite
      .findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          listing: { include: { location: { select: { county: true, town: true, estate: true } } } },
        },
      })
      .catch(() => []),
    prisma.jobApplication
      .findMany({
        where: { applicantId: userId },
        orderBy: { appliedAt: "desc" },
        take: 20,
        include: { jobPost: { select: { title: true, companyName: true, county: true } } },
      })
      .catch(() => []),
    prisma.serviceProvider.findFirst({ where: { userId } }).catch(() => null),
  ]);

  const name = user?.displayName ?? user?.name ?? session.user.displayName ?? "there";

  const stats = [
    { label: "Active listings", value: listings.filter((l) => l.status === "ACTIVE").length, tab: "listings", icon: Home },
    { label: "Saved homes", value: favourites.length, tab: "favourites", icon: Heart },
    { label: "Applications", value: applications.length, tab: "applications", icon: Briefcase },
    { label: "Service profile", value: service ? 1 : 0, tab: "services", icon: Wrench },
  ] as const;

  return (
    <div className="bg-ink-50/50 pb-16">
      <div className="border-b border-ink-100 bg-white">
        <div className="container-main flex flex-wrap items-center justify-between gap-4 py-8">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-[15px] font-bold text-primary-800">
              {initials(name)}
            </span>
            <div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">Karibu, {name.split(" ")[0]}</h1>
              <p className="mt-0.5 text-[12.5px] text-ink-500">
                {user?.email} · {titleCase(user?.role ?? "USER")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/nyumba/list"
              className="inline-flex items-center gap-2 rounded-full bg-primary-700 px-4 py-2.5 text-[12.5px] font-semibold text-white hover:bg-primary-800"
            >
              <Plus className="h-3.5 w-3.5" /> New listing
            </Link>
            <SignOutButton />
          </div>
        </div>
      </div>

      <div className="container-main py-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                href={`/dashboard?tab=${stat.tab}`}
                className={cn(
                  "rounded-2xl border bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-card",
                  tab === stat.tab ? "border-primary-200 shadow-card" : "border-ink-100"
                )}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="mt-3 text-2xl font-extrabold text-ink-900">{stat.value}</p>
                <p className="text-[11.5px] text-ink-500">{stat.label}</p>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.key}
                href={`/dashboard?tab=${t.key}`}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-semibold transition-colors",
                  tab === t.key ? "bg-primary-700 text-white" : "border border-ink-200 bg-white text-ink-700 hover:bg-ink-50"
                )}
              >
                <Icon className="h-3.5 w-3.5" /> {t.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-5 rounded-2xl border border-ink-100 bg-white">
          {tab === "listings" && (
            <div className="divide-y divide-ink-100">
              {listings.length === 0 ? (
                <Empty
                  title="No listings yet"
                  body="List your first property and it will appear here and in NyumbaHub search."
                  href="/nyumba/list"
                  cta="List a property"
                />
              ) : (
                listings.map((listing) => (
                  <Link key={listing.id} href={`/nyumba/${listing.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-ink-50/60">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                      <Home className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold text-ink-900">{listing.title}</p>
                      <p className="truncate text-[11.5px] text-ink-500">
                        {[listing.location?.town, listing.location?.county].filter(Boolean).join(", ")} · {timeAgo(listing.createdAt)}
                      </p>
                    </div>
                    <span className="hidden text-[13px] font-bold text-primary-700 sm:block">{formatKSH(listing.rent)}</span>
                    <span className="rounded-md bg-ink-50 px-2 py-1 text-[10.5px] font-semibold text-ink-600">{listing.status}</span>
                  </Link>
                ))
              )}
            </div>
          )}

          {tab === "favourites" && (
            <div className="divide-y divide-ink-100">
              {favourites.length === 0 ? (
                <Empty title="Nothing saved yet" body="Tap the heart on any listing to keep it here for later." href="/nyumba" cta="Browse homes" />
              ) : (
                favourites.map((fav) => (
                  <Link key={fav.id} href={`/nyumba/${fav.listing.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-ink-50/60">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                      <Heart className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold text-ink-900">{fav.listing.title}</p>
                      <p className="truncate text-[11.5px] text-ink-500">
                        {[fav.listing.location?.town, fav.listing.location?.county].filter(Boolean).join(", ")}
                      </p>
                    </div>
                    <span className="text-[13px] font-bold text-primary-700">{formatKSH(fav.listing.rent)}</span>
                  </Link>
                ))
              )}
            </div>
          )}

          {tab === "applications" && (
            <div className="divide-y divide-ink-100">
              {applications.length === 0 ? (
                <Empty title="No applications yet" body="Roles you apply to will be tracked here." href="/jobs" cta="Find jobs" />
              ) : (
                applications.map((application) => (
                  <div key={application.id} className="flex items-center gap-4 px-5 py-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Briefcase className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold text-ink-900">{application.jobPost.title}</p>
                      <p className="truncate text-[11.5px] text-ink-500">
                        {application.jobPost.companyName ?? "Private employer"} · applied {timeAgo(application.appliedAt)}
                      </p>
                    </div>
                    <span className="rounded-md bg-ink-50 px-2 py-1 text-[10.5px] font-semibold text-ink-600">{application.status}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "services" && (
            <div className="p-6">
              {service ? (
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[14px] font-semibold text-ink-900">{service.name}</p>
                    <p className="mt-1 text-[12px] text-ink-500">
                      {service.category} · {service.verificationStatus === "VERIFIED" ? "Verified provider" : "Awaiting verification"}
                    </p>
                  </div>
                  <Link href={`/services/${service.id}`} className="rounded-full border border-ink-200 px-4 py-2 text-[12.5px] font-semibold text-ink-800 hover:bg-ink-50">
                    View public profile
                  </Link>
                </div>
              ) : (
                <div className="text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                    <Store className="h-6 w-6" />
                  </span>
                  <p className="mt-3 text-[14px] font-semibold text-ink-900">You have not registered a service</p>
                  <p className="mx-auto mt-1 max-w-sm text-[12.5px] text-ink-500">
                    Offer your skills to the community — listing is free.
                  </p>
                  <Link href="/services/register" className="mt-4 inline-flex rounded-full bg-primary-700 px-4 py-2.5 text-[12.5px] font-semibold text-white hover:bg-primary-800">
                    Register a service
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Empty({ title, body, href, cta }: { title: string; body: string; href: string; cta: string }) {
  return (
    <div className="px-6 py-14 text-center">
      <p className="text-[14px] font-semibold text-ink-900">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-[12.5px] text-ink-500">{body}</p>
      <Link href={href} className="mt-4 inline-flex rounded-full bg-primary-700 px-4 py-2.5 text-[12.5px] font-semibold text-white hover:bg-primary-800">
        {cta}
      </Link>
    </div>
  );
}
