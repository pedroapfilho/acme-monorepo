import { headers } from "next/headers";
import { cache } from "react";

import { auth } from "./auth";

// Server-side function to get the current session
export const getSession = cache(async () => {
  const headersList = await headers();

  try {
    const session = await auth.api.getSession({
      headers: headersList,
    });

    return session;
  } catch {
    return null;
  }
});
