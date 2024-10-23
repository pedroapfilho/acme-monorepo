import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

const middleware = auth((request: NextRequest) => {
  const hasAuthenticated = "auth" in request && request.auth;

  const isAuthenticating =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register") ||
    request.nextUrl.pathname.startsWith("/recover");

  const isResettingPassword =
    request.nextUrl.pathname.startsWith("/reset-password");

  if (isAuthenticating) {
    if (hasAuthenticated && !isResettingPassword) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return;
  }

  if (!hasAuthenticated) {
    let from = request.nextUrl.pathname;

    if (request.nextUrl.search) {
      from += request.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, request.url),
    );
  }
});

const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export { config };

export default middleware;
