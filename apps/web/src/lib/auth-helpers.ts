import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { getAuth } from "./auth";

const getSession = (requestHeaders: Headers) =>
  getAuth().api.getSession({ headers: requestHeaders });

const loginUrl = (from: string) => `/login?${new URLSearchParams({ from }).toString()}`;

const createRequireSession = (lookup: typeof getSession, requestHeaders: () => Promise<Headers>) =>
  cache(async (from: string) => {
    const session = await lookup(await requestHeaders());
    if (!session) {
      redirect(loginUrl(from));
    }
    return session;
  });

const requireSession = createRequireSession(getSession, headers);

export { createRequireSession, getSession, loginUrl, requireSession };
