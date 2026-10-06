import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { getAuth } from "./auth";

const getSession = (requestHeaders: Headers) =>
  getAuth().api.getSession({ headers: requestHeaders });

const loginUrl = (from: string) => `/login?${new URLSearchParams({ from }).toString()}`;

const requireSession = cache(async (from: string) => {
  const session = await getSession(await headers());
  if (!session) {
    redirect(loginUrl(from));
  }
  return session;
});

export { getSession, loginUrl, requireSession };
