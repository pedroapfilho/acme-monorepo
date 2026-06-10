import "./fields";

import { createAuthMiddleware, type BetterAuthInstance } from "evlog/better-auth";

/**
 * Wraps evlog's Better Auth middleware. Returns identify(log, headers, path?)
 * which resolves the session and attaches userId/whitelisted fields to the
 * current wide event. Identity is resolved in the request middleware layer —
 * NOT in betterAuth() config — so no auth-config hooks are required.
 */
const createIdentify = (auth: BetterAuthInstance, opts?: { exclude?: Array<string> }) =>
  createAuthMiddleware(auth, { exclude: opts?.exclude ?? ["/api/auth/**"] });

export { createIdentify };
