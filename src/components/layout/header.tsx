"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/jobs", label: "Jobs" },
  { href: "/nyumba", label: "NyumbaHub" },
  { href: "/services", label: "Services" },
  { href: "/prices", label: "Prices" },
  { href: "/safety", label: "Safety" },
  { href: "/ai", label: "AI Assistant" },
];

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const user = session?.user;
  const initial = (user?.displayName || user?.name || user?.email || "U").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-ink-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="container-main">
        <div className="flex h-[78px] items-center justify-between gap-4">
          <Link href="/" aria-label="MtaaHub home" className="flex items-center">
            <Logo size={42} />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative py-2 text-[15px] font-medium transition-colors",
                  isActive(item.href) ? "text-primary-800" : "text-ink-600 hover:text-primary-700"
                )}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute -bottom-0.5 left-0 h-0.5 w-full rounded-full bg-primary-600" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            {status === "loading" ? (
              <div className="h-10 w-32 animate-pulse rounded-full bg-ink-100" />
            ) : user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-ink-200 py-1.5 pl-1.5 pr-3 text-sm font-semibold text-ink-800 transition-colors hover:bg-ink-50"
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-800">
                    {initial}
                  </span>
                  <span className="hidden max-w-[9rem] truncate sm:block">
                    {user.displayName || user.name || "Account"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-ink-400" />
                </button>

                {menuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-ink-100 bg-white p-1.5 shadow-float"
                    role="menu"
                  >
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
                      role="menuitem"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
                      role="menuitem"
                    >
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-100 text-[9px] font-bold text-primary-800">
                        {initial}
                      </span>
                      My profile
                    </Link>
                    {(user.role === "SUPER_ADMIN" || user.role === "MODERATOR") && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
                        role="menuitem"
                      >
                        <LayoutDashboard className="h-4 w-4" /> Admin console
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                      role="menuitem"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="hidden rounded-full border border-primary-700/25 px-5 py-2.5 text-sm font-semibold text-ink-900 transition-colors hover:border-primary-700/50 hover:bg-primary-50 sm:inline-flex"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signin?mode=signup"
                  className="inline-flex rounded-full bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-800"
                >
                  Sign Up
                </Link>
              </>
            )}

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-700 hover:bg-ink-50 lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="border-t border-ink-100 bg-white lg:hidden">
          <nav className="container-main flex flex-col py-3" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3 py-3 text-base font-medium",
                  isActive(item.href) ? "bg-primary-50 text-primary-800" : "text-ink-700 hover:bg-ink-50"
                )}
              >
                {item.label}
              </Link>
            ))}
            {!user && (
              <Link
                href="/auth/signin"
                className="mt-2 rounded-xl border border-ink-200 px-3 py-3 text-center text-base font-semibold text-ink-900"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
