import { mkdir } from "node:fs/promises";

import { expect, test as setup } from "@playwright/test";

import { webUrl } from "../../../playwright.config";

const TEST_USER = {
  email: "e2e-test@acme.localhost",
  name: "E2E Test User",
  password: "TestPassword123!",
};

const STORAGE_STATE_PATH = "tests/e2e/.auth/user.json";

// API sign-in avoids TanStack Form hydration race (Playwright clicks before onSubmit attaches).
setup("create and authenticate test user", async ({ page, request }) => {
  await mkdir("tests/e2e/.auth", { recursive: true });

  const signIn = await request.post(`${webUrl}/api/auth/sign-in/email`, {
    data: { email: TEST_USER.email, password: TEST_USER.password },
  });
  expect(signIn.status()).toBe(200);

  // headersArray() preserves multiple Set-Cookie entries; headers()["set-cookie"] flattens them.
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
