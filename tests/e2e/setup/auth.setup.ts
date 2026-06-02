import { mkdirSync } from "node:fs";

import { expect, test as setup } from "@playwright/test";

import { webUrl } from "../../../playwright.config";

const TEST_USER = {
  email: "e2e-test@acme.localhost",
  name: "E2E Test User",
  password: "TestPassword123!",
};

const STORAGE_STATE_PATH = "tests/e2e/.auth/user.json";

// Seeds storageState by signing the pre-seeded e2e user in via the auth
// API (no browser, no form). The user itself is created by
// `apps/web/scripts/ensure-e2e-user.ts` — that script writes directly to
// Prisma with `emailVerified: true`, so this sign-in works even when
// `requireEmailVerification` is on (the Resend-gated CI/prod path).
//
// The previous UI-form login was racy: TanStack Form's onSubmit attaches
// after React hydrates, and Playwright clicked the submit button before
// that landed, falling back to a native GET form submit that left the
// user stranded on /login. API sign-in sidesteps that entirely.
setup("create and authenticate test user", async ({ page, request }) => {
  mkdirSync("tests/e2e/.auth", { recursive: true });

  const signIn = await request.post(`${webUrl}/api/auth/sign-in/email`, {
    data: { email: TEST_USER.email, password: TEST_USER.password },
  });
  expect(signIn.status()).toBe(200);

  // Thread the Set-Cookie headers from the API response into the browser
  // context so dependent specs start authenticated. `headersArray()`
  // preserves multiple Set-Cookie entries (Better Auth issues two:
  // session_token + session_data); `headers()["set-cookie"]` flattens
  // them into a single comma-joined string and the dot in the cookie
  // name makes re-splitting fragile.
  const setCookieHeaders = signIn
    .headersArray()
    .filter((h) => h.name.toLowerCase() === "set-cookie")
    .map((h) => h.value);
  const webHost = new URL(webUrl).hostname;
  const browserCookies = [];
  for (const part of setCookieHeaders) {
    const [nameValue] = part.split(";");
    const eq = nameValue.indexOf("=");
    if (eq === -1) {
      continue;
    }
    browserCookies.push({
      domain: webHost,
      httpOnly: true,
      name: nameValue.slice(0, eq).trim(),
      path: "/",
      sameSite: "Lax" as const,
      secure: webUrl.startsWith("https://"),
      value: nameValue.slice(eq + 1).trim(),
    });
  }
  await page.context().addCookies(browserCookies);

  await page.context().storageState({ path: STORAGE_STATE_PATH });
});

export { TEST_USER };
