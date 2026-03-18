import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth";

const protectedRoutes = ["/dashboard", "/profile", "/settings"];

const authRoutes = ["/login", "/register", "/forgot-password", "/recover", "/reset-password"];

export const proxy = async (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  const session = await auth.api
    .getSession({
      headers: request.headers,
    })
    .catch((error) => {
      // Auth service failure (DB down, misconfiguration, etc.) — log so outages
      // are observable, then treat as unauthenticated to keep the pipeline moving.
      // oxlint-disable-next-line no-console
      console.error("[proxy] getSession failed — treating as unauthenticated", { error, pathname });
      return null;
    });

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
