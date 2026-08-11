import { webUrl } from "../../../playwright.config";
import { test, expect } from "../fixtures/auth.fixture";

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
        name: "acme.session_token",
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
  test("redirects unauthenticated users to login with from param", async ({ page }) => {
    await page.context().clearCookies();

    await page.goto("/dashboard");
    await page.waitForURL(/\/login/);

    expect(page.url()).toContain("/login");
    expect(page.url()).toContain("from=%2Fdashboard");
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
