import { headers } from "next/headers";
import { cache } from "react";

import { getAuth } from "./auth";
import { log } from "./observability";

export const getSession = cache(async () => {
  const headersList = await headers();

  try {
    const session = await getAuth().api.getSession({
      headers: headersList,
    });

    return session;
  } catch (error) {
    // Auth failures look identical to "logged out" — must log to diagnose.
    log.error({
      error: error instanceof Error ? error.message : String(error),
      message: "getSession failed",
    });
    return null;
  }
});
