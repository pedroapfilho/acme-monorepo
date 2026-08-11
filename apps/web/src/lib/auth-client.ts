"use client";

import { createBetterAuthClient } from "@repo/auth/client";

export const authClient = createBetterAuthClient(
  typeof window === "undefined" ? "" : `${window.location.origin}/api/auth`,
);
