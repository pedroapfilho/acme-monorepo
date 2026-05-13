import crypto from "node:crypto";

import type { TestInfo } from "@playwright/test";

// Resend's `delivered+<label>@resend.dev` simulates a successful delivery
// without affecting sender reputation. The label is preserved in Resend's
// test dashboard so failed runs can be traced back to a spec by title.
const makeTestEmail = (info: TestInfo): string => {
  const slug = info.title.replaceAll(/\W+/g, "-").toLowerCase().slice(0, 40);
  const run = process.env.GITHUB_RUN_ID ?? crypto.randomBytes(4).toString("hex");
  return `delivered+${run}-${slug}@resend.dev`;
};

// Better Auth's `username()` plugin makes username effectively required at
// signup. Default validator is /^[a-zA-Z0-9_.]+$/ (see better-auth/plugins/
// username/index.mjs:defaultUsernameValidator) — dashes are NOT allowed,
// so the slug uses underscores. Derive from the test email to stay
// unique-per-run and traceable back to the spec.
const makeTestUsername = (email: string): string =>
  `e2e_${email.split("@")[0].replaceAll(/\W/g, "_").slice(0, 30)}`;

export { makeTestEmail, makeTestUsername };
