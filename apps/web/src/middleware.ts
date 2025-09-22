import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/settings",
  "/api/protected",
];

// Define auth routes (should redirect to dashboard if already logged in)
const authRoutes = ["/login", "/register", "/forgot-password"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Check if the route is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Skip middleware for public routes
  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  // Get session for all routes (both protected and auth pages)
  let session = null;
  try {
    session = await auth.api.getSession({
      headers: request.headers,
    });
  } catch (error) {
    console.error("[Middleware] Session check error:", error);
  }

  console.log(
    "[Middleware]",
    pathname,
    "- Session:",
    !!session,
    "- IsProtected:",
    isProtectedRoute,
    "- IsAuth:",
    isAuthRoute,
  );

  // Handle protected routes
  if (isProtectedRoute && !session) {
    // Redirect to login with return URL
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Handle auth routes (redirect to dashboard if already logged in)
  if (isAuthRoute && session) {
    const url = new URL("/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  // Add session to headers for use in server components
  if (session) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", session.user.id);
    requestHeaders.set("x-user-email", session.user.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // All other cases, continue normally
  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
