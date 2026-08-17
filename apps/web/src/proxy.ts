import { COOKIE_PREFIX } from "@repo/auth/server";
import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getAuth } from "@/lib/auth";
import { log } from "@/lib/observability";

const protectedRoutes = ["/dashboard", "/profile", "/settings"];

// /reset-password is deliberately absent: bouncing an authenticated visitor to the dashboard would
// make a reset link unusable for anyone still holding a session.
const authRoutes = ["/login", "/register", "/recover"];

const getSessionOrNull = async (request: NextRequest) => {
  try {
    return await getAuth().api.getSession({ headers: request.headers });
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
