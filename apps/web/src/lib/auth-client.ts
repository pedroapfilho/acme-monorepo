"use client";

import { createBetterAuthClient } from "@repo/auth/client";
import type { Auth } from "@repo/auth/server";
import { inferAdditionalFields, usernameClient } from "better-auth/client/plugins";

const authClient = createBetterAuthClient({
  plugins: [inferAdditionalFields<Auth>(), usernameClient()],
});

export { authClient };
