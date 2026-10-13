import { randomBytes } from "node:crypto";

import type { TestInfo } from "@playwright/test";

// Resend delivers `delivered+<label>@resend.dev` without reputation cost; the short slug keeps a
// change-email `new-` label inside RFC 5321's 64-character local part.
const makeTestEmail = (info: TestInfo): string => {
  const slug = info.title.replaceAll(/\W+/gv, "-").toLowerCase().slice(0, 28);
  return `delivered+${randomBytes(4).toString("hex")}-${slug}@resend.dev`;
};

export { makeTestEmail };
