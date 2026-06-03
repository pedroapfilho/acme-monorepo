import type { APIRequestContext } from "@playwright/test";

import { webUrl } from "../../../playwright.config";
import { expect, test } from "../fixtures/auth.fixture";

const PASSWORD = "TestPassword123!";

// Logout invalidates the DB session row; reusing the shared storageState user
// would 401 every other spec once Better Auth's 5-minute cookie cache expires.
const createIsolatedUser = async (request: APIRequestContext): Promise<string> => {
  const email = `logout-test-${crypto.randomUUID()}@acme.localhost`;
  const response = await request.post(`${webUrl}/api/auth/sign-up/email`, {
    data: { email, name: "Logout Test User", password: PASSWORD },
  });
  expect([200, 201]).toContain(response.status());
  return email;
};

// With RESEND_API_KEY set, requireEmailVerification blocks fresh-signup → /dashboard;
// the auth-email/* suite covers that path.
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
