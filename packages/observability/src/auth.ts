import "./fields";

import { createAuthMiddleware, type BetterAuthInstance } from "evlog/better-auth";

/** Session identity in request middleware, not betterAuth() config — no auth-config hooks needed. */
const createIdentify = (auth: BetterAuthInstance, opts?: { exclude?: Array<string> }) =>
  createAuthMiddleware(auth, { exclude: opts?.exclude ?? ["/api/auth/**"] });

export { createIdentify };
