import { log } from "@repo/observability";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSession } from "@/lib/auth-helpers";
import { authPageHref, HOME_PATH } from "@/lib/redirect-validation";

const protectedRoutes = ["/dashboard"];

// /reset-password is deliberately absent: bouncing an authenticated visitor to the dashboard would
// make a reset link unusable for anyone still holding a session.
const authRoutes = new Set(["/login", "/register", "/recover"]);

export const createProxy = (lookup: typeof getSession) => async (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;
  const isRoot = pathname === "/";

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const isAuthRoute = authRoutes.has(pathname);

  if (!isRoot && !isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  let session;

  try {
    session = await lookup(request.headers);
  } catch (error) {
    log.error(new Error("Proxy: failed to look up session", { cause: error }));
  }

  if (isRoot) {
    return NextResponse.redirect(new URL(session ? HOME_PATH : "/login", request.url));
  }

  if (isProtectedRoute && !session) {
    const url = new URL(
      authPageHref("/login", `${pathname}${request.nextUrl.search}`),
      request.url,
    );

    return NextResponse.redirect(url);
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL(HOME_PATH, request.url));
  }

  return NextResponse.next();
};

export const proxy = createProxy(getSession);

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|icon.svg|public).*)"],
};
