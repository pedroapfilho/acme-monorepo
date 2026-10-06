import { COOKIE_PREFIX } from "@repo/auth/server";
import { log } from "@repo/observability";
import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSession, loginUrl } from "@/lib/auth-helpers";

const protectedRoutes = ["/dashboard"];

// /reset-password is deliberately absent: bouncing an authenticated visitor to the dashboard would
// make a reset link unusable for anyone still holding a session.
const authRoutes = new Set(["/login", "/register", "/recover"]);

export const createProxy = (lookup: typeof getSession) => async (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/") {
    const destination =
      getSessionCookie(request, { cookiePrefix: COOKIE_PREFIX }) === null ? "/login" : "/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const isAuthRoute = authRoutes.has(pathname);

  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  let session;
  try {
    session = await lookup(request.headers);
  } catch (error) {
    log.error(new Error("Proxy: failed to look up session", { cause: error }));
  }

  if (isProtectedRoute && !session) {
    const url = new URL(loginUrl(`${pathname}${request.nextUrl.search}`), request.url);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && session) {
    const url = new URL("/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
};

export const proxy = createProxy(getSession);

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|icon.svg|public).*)"],
};
