import { COOKIE_PREFIX } from "@repo/auth/server";
import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { log } from "@/lib/observability";

const protectedRoutes = ["/dashboard", "/profile", "/settings"];

const authRoutes = ["/login", "/register", "/recover", "/reset-password"];

const getSessionOrNull = async (request: NextRequest) => {
  try {
    // Touching `auth` instantiates it and throws synchronously when BETTER_AUTH_SECRET is absent;
    // .catch() can't intercept that.
    return await auth.api.getSession({ headers: request.headers });
  } catch (error) {
    log.error({
      error: error instanceof Error ? error.message : String(error),
      message: "proxy: getSession failed; treating as unauthenticated",
      pathname: request.nextUrl.pathname,
    });
    return null;
  }
};

export const proxy = async (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;

  // "/" only ever redirects, so decide it here from the cookie's presence alone:
  // rendering a page to call redirect() costs a server round trip and a session
  // lookup. Presence is deliberately not validity. A stale cookie sends the
  // visitor to /dashboard, which does the authoritative check below and bounces
  // them to /login.
  if (pathname === "/") {
    const destination =
      getSessionCookie(request, { cookiePrefix: COOKIE_PREFIX }) === null ? "/login" : "/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  const session = await getSessionOrNull(request);

  if (isProtectedRoute && !session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && session) {
    const url = new URL("/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|icon.svg|public).*)"],
};
