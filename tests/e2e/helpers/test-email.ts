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
// signup. Default validator is /^[a-zA-Z0-9_.]+$/ (dashes rejected) and
// maxUsernameLength defaults to 30. Derive from a hash of the email so it
// stays unique-per-run but well under the limit (4 + 16 = 20 chars), even
// after specs append `_2`, `_b`, etc.
const makeTestUsername = (email: string): string => {
  const hash = crypto.createHash("sha256").update(email).digest("hex").slice(0, 16);
  return `e2e_${hash}`;
};

export { makeTestEmail, makeTestUsername };
