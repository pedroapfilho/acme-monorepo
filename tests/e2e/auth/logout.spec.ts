import type { APIRequestContext } from "@playwright/test";

import { webUrl } from "../../../playwright.config";
import { expect, test } from "../fixtures/auth.fixture";

const PASSWORD = "TestPassword123!";

// Logout invalidates the session row in the database. If these tests reused the
// shared `e2e-test@acme.localhost` user from the setup project, the moment one
// of them ran, every other test sharing that storageState would 401 once the
// 5-minute Better Auth cookie cache expired (packages/auth/src/server.ts:193).
// So each logout test owns a freshly created user instead.
const createIsolatedUser = async (request: APIRequestContext): Promise<string> => {
  const email = `logout-test-${crypto.randomUUID()}@acme.localhost`;
  const response = await request.post(`${webUrl}/api/auth/sign-up/email`, {
    data: { email, name: "Logout Test User", password: PASSWORD },
  });
  expect([200, 201]).toContain(response.status());
  return email;
};

// With RESEND_API_KEY set, requireEmailVerification flips on and a
// fresh-signup-then-sign-in flow can't land at /dashboard — the user
// stays on the verify-pending screen. The auth-email/* suite covers
// the Resend path; these UI logout assertions belong to the
// no-Resend local-dev path.
const skipUnderResend = !!process.env.RESEND_API_KEY;

test.describe("Logout", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("signs out and redirects to login", async ({ dashboardPage, loginPage, page, request }) => {
    test.skip(skipUnderResend, "Resend-enabled flow blocks fresh-signup → sign-in");

    const email = await createIsolatedUser(request);
    await loginPage.goto();
    await loginPage.login(email, PASSWORD);
    await page.waitForURL("/dashboard");
    await dashboardPage.expectHeadingVisible();

    await dashboardPage.signOut();

    await page.waitForURL("/login");
    expect(page.url()).toContain("/login");
  });

  test("cannot access dashboard after logout", async ({
    dashboardPage,
    loginPage,
    page,
    request,
  }) => {
    test.skip(skipUnderResend, "Resend-enabled flow blocks fresh-signup → sign-in");

    const email = await createIsolatedUser(request);
    await loginPage.goto();
    await loginPage.login(email, PASSWORD);
    await page.waitForURL("/dashboard");

    await dashboardPage.signOut();
    await page.waitForURL("/login");

    await page.goto("/dashboard");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });
});
