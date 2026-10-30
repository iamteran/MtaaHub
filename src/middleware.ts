import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/admin", "/biashara"];
const PROTECTED_EXACT = ["/nyumba/list", "/jobs/post", "/services/register", "/prices/submit"];

const STAFF_ROLES = ["SUPER_ADMIN", "MODERATOR", "VERIFICATION_OFFICER", "SUPPORT_STAFF"];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: request.nextUrl.protocol === "https:",
  });

  const isProtected =
    PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) ||
    PROTECTED_EXACT.includes(pathname);

  if (isProtected && !token) {
    const callbackUrl = encodeURIComponent(`${pathname}${search}`);
    return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, request.url));
  }

  if (pathname.startsWith("/admin")) {
    if (!token || !STAFF_ROLES.includes((token.role as string) ?? "")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/biashara/:path*",
    "/nyumba/list",
    "/jobs/post",
    "/services/register",
    "/prices/submit",
  ],
};
