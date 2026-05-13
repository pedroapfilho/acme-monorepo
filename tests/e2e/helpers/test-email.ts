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

export { makeTestEmail };
