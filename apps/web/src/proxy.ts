import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { log } from "@/lib/observability";

const protectedRoutes = ["/dashboard", "/profile", "/settings"];

const authRoutes = ["/login", "/register", "/recover", "/reset-password"];

const getSessionOrNull = async (request: NextRequest) => {
  try {
    // Touching `auth` instantiates it and throws synchronously when BETTER_AUTH_SECRET is absent —
    // .catch() can't intercept that.
    return await auth.api.getSession({ headers: request.headers });
  } catch (error) {
    log.error({
      error: error instanceof Error ? error.message : String(error),
      message: "proxy: getSession failed — treating as unauthenticated",
      pathname: request.nextUrl.pathname,
    });
    return null;
  }
};

export const proxy = async (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;

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
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)"],
};
