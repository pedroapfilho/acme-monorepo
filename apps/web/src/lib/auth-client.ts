"use client";

import { createBetterAuthClient } from "@repo/auth/client";
import { usernameClient } from "better-auth/client/plugins";

const authClient = createBetterAuthClient({
  baseURL: typeof window === "undefined" ? "" : `${window.location.origin}/api/auth`,
  plugins: [usernameClient()],
});

export { authClient };
