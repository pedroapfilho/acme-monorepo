import crypto from "node:crypto";

import type { TestInfo } from "@playwright/test";

// Resend `delivered+<label>@resend.dev` simulates delivery without reputation cost; slice GITHUB_RUN_ID to 8 chars so the change-email `new-` prefix stays under RFC 5321's 64-char local-part limit.
const makeTestEmail = (info: TestInfo): string => {
  const slug = info.title.replaceAll(/\W+/gv, "-").toLowerCase().slice(0, 28);
  const run = (process.env.GITHUB_RUN_ID ?? crypto.randomBytes(4).toString("hex")).slice(-8);
  return `delivered+${run}-${slug}@resend.dev`;
};

const makeTestUsername = (email: string): string => {
  const hash = crypto.createHash("sha256").update(email).digest("hex").slice(0, 16);
  return `e2e_${hash}`;
};

export { makeTestEmail, makeTestUsername };
