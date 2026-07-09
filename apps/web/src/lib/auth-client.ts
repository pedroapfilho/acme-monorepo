"use client";

import { createBetterAuthClient } from "@repo/auth/client";

// Empty SSR fallback: Better Auth rejects non-absolute baseURLs during prerender.
export const authClient = createBetterAuthClient(
  typeof window === "undefined" ? "" : `${window.location.origin}/api/auth`,
);
