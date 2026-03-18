import { headers } from "next/headers";
import { cache } from "react";

import { auth } from "./auth";

export const getSession = cache(async () => {
  const headersList = await headers();

  try {
    const session = await auth.api.getSession({
      headers: headersList,
    });

    return session;
  } catch (error) {
    // Auth failures (DB down, misconfiguration) must not be silent — they
    // look identical to "logged out" without a log entry to diagnose.
    // oxlint-disable-next-line no-console
    console.error("[auth-helpers] getSession failed", { error });
    return null;
  }
});
