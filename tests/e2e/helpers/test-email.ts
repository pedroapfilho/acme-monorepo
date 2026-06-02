import crypto from "node:crypto";

import type { TestInfo } from "@playwright/test";

// Resend's `delivered+<label>@resend.dev` simulates a successful delivery
// without affecting sender reputation. The label is preserved in Resend's
// test dashboard so failed runs can be traced back to a spec by title.
//
// Local-part budget (RFC 5321: 64 chars): `delivered+new-<8>-<28>` is
// 51 chars, leaving room for the `new-` prefix the change-email spec
// adds. GITHUB_RUN_ID is sliced to its last 8 chars so a long CI id
// doesn't tip the address past 64 and trip Resend's "Invalid `to`
// field" rejection.
const makeTestEmail = (info: TestInfo): string => {
  const slug = info.title.replaceAll(/\W+/g, "-").toLowerCase().slice(0, 28);
  const run = (process.env.GITHUB_RUN_ID ?? crypto.randomBytes(4).toString("hex")).slice(-8);
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
