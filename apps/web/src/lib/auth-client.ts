"use client";

import { createBetterAuthClient } from "@repo/auth/client";

// Auth lives on the same origin at /api/auth via the Next.js route handler.
// Empty SSR fallback matches the sibling repos; Better Auth validates non-empty
// baseURLs as absolute URLs, so `"/api/auth"` would blow up during Next.js
// prerender. All call sites are `"use client"` — SSR evaluation never actually
// hits the client fetch path.
export const authClient = createBetterAuthClient(
  typeof window !== "undefined" ? `${window.location.origin}/api/auth` : "",
);
