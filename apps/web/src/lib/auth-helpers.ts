import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { getAuth } from "./auth";
import { authPageHref } from "./redirect-validation";

const getSession = (requestHeaders: Headers) =>
  getAuth().api.getSession({ headers: requestHeaders });

const requireSession = cache(async (from: string) => {
  const session = await getSession(await headers());
  if (!session) {
    redirect(authPageHref("/login", from));
  }
  return session;
});

export { getSession, requireSession };
