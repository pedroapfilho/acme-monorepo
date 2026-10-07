import { test, expect } from "../fixtures/auth.fixture";
import { sessionCookieName } from "../fixtures/session";
import { TEST_USER } from "../fixtures/test-user";
import { webUrl } from "../urls";

test.describe("Root redirect", () => {
  test("sends anonymous visitors to login", async ({ page }) => {
    await page.context().clearCookies();

    await page.goto("/");
    await page.waitForURL(/\/login/);

    expect(page.url()).toContain("/login");
  });

  test("sends signed-in visitors to the dashboard", async ({ page }) => {
    await page.goto("/");

    await page.waitForURL("/dashboard");
    expect(page.url()).toContain("/dashboard");
  });

  test("sends visitors holding a stale session cookie to login", async ({ page }) => {
    await page.context().clearCookies();
    await page.context().addCookies([
      {
        name: sessionCookieName,
        url: webUrl,
        value: "stale-session-token-that-matches-no-session",
      },
    ]);

    await page.goto("/");
    await page.waitForURL(/\/login/);

    expect(page.url()).toContain("/login");
  });
});

test.describe("Protected Routes", () => {
  test("returns signed-out visitors to the requested page after sign-in", async ({
    loginPage,
    page,
  }) => {
    const requested = "/dashboard/settings?tab=x";
    await page.context().clearCookies();

    await page.goto(requested);
    await page.waitForURL(/\/login/v);
    expect(new URL(page.url()).searchParams.get("from")).toBe(requested);

    await loginPage.login(TEST_USER.email, TEST_USER.password);
    await page.waitForURL(requested);
  });

  test("redirects authenticated users from auth routes to dashboard", async ({ page }) => {
    await page.goto("/login");

    await page.waitForURL("/dashboard");
    expect(page.url()).toContain("/dashboard");
  });

  test("allows authenticated access to dashboard", async ({ dashboardPage }) => {
    await dashboardPage.goto();

    await dashboardPage.expectHeadingVisible();
    await dashboardPage.expectUserEmailVisible();
  });
});
