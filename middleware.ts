import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/lib/i18n/config";

// NOTE: middleware runs in the Edge runtime — use jose instead of jsonwebtoken for JWT verify here.
// We do a lightweight cookie/token presence check here; deep JWT verification happens in API routes.

const PROTECTED_ADMIN_PATHS = [
  "/admin/dashboard",
  "/admin/add-news",
  "/admin/edit-news",
  "/admin/super-admin",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin route protection ─────────────────────────────────
  const isProtected = PROTECTED_ADMIN_PATHS.some((p) => pathname.startsWith(p));
  if (isProtected) {
    const token =
      request.cookies.get("admin_token")?.value ??
      request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin";
      loginUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(loginUrl);
    }

    // Role-specific protection: super-admin routes
    if (pathname.startsWith("/admin/super-admin")) {
      // We decode without verification here (Edge runtime limitation).
      // Full verification happens in each API route.
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payloadStr = Buffer.from(parts[1], "base64url").toString("utf8");
          const payload = JSON.parse(payloadStr);
          if (payload.role !== "super_admin") {
            const dashUrl = request.nextUrl.clone();
            dashUrl.pathname = "/admin/dashboard";
            dashUrl.searchParams.set("error", "forbidden");
            return NextResponse.redirect(dashUrl);
          }
        }
      } catch {
        // If decode fails, let the page handle it
      }
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // ── i18n locale routing ────────────────────────────────────
  const segments = pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0];

  if (maybeLocale && isLocale(maybeLocale)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale", maybeLocale);

    const res = NextResponse.next({
      request: { headers: requestHeaders },
    });
    res.headers.set("x-locale", maybeLocale);
    return res;
  }

  const url = request.nextUrl.clone();
  url.pathname =
    pathname === "/"
      ? `/${defaultLocale}`
      : `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
