import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const hasAuthenticated = req.auth;

  const isAuthenticating =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register") ||
    req.nextUrl.pathname.startsWith("/recover");

  const isResettingPassword =
    req.nextUrl.pathname.startsWith("/reset-password");

  if (isAuthenticating) {
    if (hasAuthenticated && !isResettingPassword) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return;
  }

  if (!hasAuthenticated) {
    let from = req.nextUrl.pathname;

    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, req.url),
    );
  }
});

export const config = {
  matcher: [
    "/login",
    "/register",
    "/recover",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
