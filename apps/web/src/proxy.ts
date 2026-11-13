import { log, serializeError } from "@repo/observability";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSession } from "@/lib/auth-helpers";
import { authPageHref } from "@/lib/redirect-validation";
import { HOME_PATH, routeAccess, routes } from "@/lib/routes";

const redirectFor = (access: "entry" | "guest" | "signed-in", signedIn: boolean, from: string) => {
  if (signedIn) {
    return access === "signed-in" ? null : HOME_PATH;
  }

  if (access === "guest") {
    return null;
  }

  return access === "entry" ? routes.login.path : authPageHref(routes.login.path, from);
};

export const createProxy = (lookup: typeof getSession) => async (request: NextRequest) => {
  const { pathname, search } = request.nextUrl;
  const access = pathname === "/" ? "entry" : routeAccess(pathname);

  if (access === "public") {
    return NextResponse.next();
  }

  let session;

  try {
    session = await lookup(request.headers);
  } catch (error) {
    log.error({ error: serializeError(error), message: "Proxy: failed to look up session" });

    // Treating an auth outage as "signed out" would bounce every signed-in visitor to /login.
    return new NextResponse("Authentication service unavailable", {
      headers: { "Cache-Control": "no-store" },
      status: 503,
    });
  }

  const destination = redirectFor(access, Boolean(session), `${pathname}${search}`);

  return destination === null
    ? NextResponse.next()
    : NextResponse.redirect(new URL(destination, request.url));
};

export const proxy = createProxy(getSession);

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|icon.svg|public).*)"],
};
