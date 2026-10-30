import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updateDisplayName } from "@/app/actions";
import { KENYAN_COUNTIES, formatDate, initials } from "@/lib/utils";
import { SignOutButton } from "@/components/site/sign-out-button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My profile" };

export default async function ProfilePage({ searchParams }: { searchParams: { error?: string; saved?: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/profile");

  const user = await prisma.user
    .findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true, displayName: true, phone: true, county: true, town: true, role: true, createdAt: true },
    })
    .catch(() => null);

  const displayName = user?.displayName ?? user?.name ?? "";

  return (
    <div className="bg-ink-50/50 pb-16">
      <div className="border-b border-ink-100 bg-white">
        <div className="container-main flex flex-wrap items-center justify-between gap-4 py-8">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-[15px] font-bold text-primary-800">
              {initials(displayName || user?.email)}
            </span>
            <div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">My profile</h1>
              <p className="mt-0.5 text-[12.5px] text-ink-500">
                Member since {formatDate(user?.createdAt)} · {user?.email}
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </div>

      <div className="container-main mt-8 grid max-w-4xl gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-ink-100 bg-white p-6">
          {searchParams.saved && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 p-3 text-[12.5px] text-primary-800">
              <CheckCircle2 className="h-4 w-4" /> Profile updated.
            </div>
          )}
          {searchParams.error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[12.5px] text-red-700" role="alert">
              <AlertCircle className="h-4 w-4" /> {searchParams.error}
            </div>
          )}

          <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-500">Account details</h2>

          <form action={updateDisplayName} className="mt-4 space-y-4">
            <div>
              <label htmlFor="displayName" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                Display name
              </label>
              <input id="displayName" name="displayName" defaultValue={displayName} required minLength={2} maxLength={40} className="input-base" />
              <p className="mt-1 text-[11px] text-ink-500">This is the name shown on your listings and profile.</p>
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                Phone number
              </label>
              <input id="phone" name="phone" defaultValue={user?.phone ?? ""} placeholder="0712 345 678" className="input-base" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="county" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  County
                </label>
                <select id="county" name="county" defaultValue={user?.county ?? ""} className="input-base">
                  <option value="">Select county</option>
                  {KENYAN_COUNTIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="town" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Town
                </label>
                <input id="town" name="town" defaultValue={user?.town ?? ""} className="input-base" />
              </div>
            </div>

            <button type="submit" className="inline-flex h-11 items-center justify-center rounded-xl bg-primary-700 px-5 text-sm font-semibold text-white hover:bg-primary-800">
              Save changes
            </button>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-ink-100 bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">Quick links</p>
            <div className="mt-3 space-y-1.5">
              <Link href="/dashboard" className="block rounded-lg px-3 py-2 text-[12.5px] font-medium text-ink-700 hover:bg-ink-50">
                My dashboard
              </Link>
              <Link href="/nyumba/list" className="block rounded-lg px-3 py-2 text-[12.5px] font-medium text-ink-700 hover:bg-ink-50">
                List a property
              </Link>
              <Link href="/jobs/post" className="block rounded-lg px-3 py-2 text-[12.5px] font-medium text-ink-700 hover:bg-ink-50">
                Post a job
              </Link>
              <Link href="/services/register" className="block rounded-lg px-3 py-2 text-[12.5px] font-medium text-ink-700 hover:bg-ink-50">
                Register a service
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-ink-100 bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">Account</p>
            <p className="mt-3 text-[12.5px] text-ink-600">Role: {user?.role ?? "USER"}</p>
            <p className="mt-1 text-[11.5px] text-ink-500">
              Email is managed by your sign-in provider and cannot be changed here.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
