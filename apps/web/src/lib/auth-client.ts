"use client";

import { createBetterAuthClient } from "@repo/auth/client";

// Auth lives on the same origin at /api/auth via the Next.js route handler —
// no rewrite proxy, no cross-origin concerns. Every call site is "use client",
// so the SSR fallback is never exercised; keep it relative for clarity.
export const authClient = createBetterAuthClient(
  typeof window !== "undefined" ? `${window.location.origin}/api/auth` : "/api/auth",
);
