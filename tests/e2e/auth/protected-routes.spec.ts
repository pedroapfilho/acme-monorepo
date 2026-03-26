import { test, expect } from "../fixtures/auth.fixture";

test.describe("Protected Routes", () => {
  test("redirects unauthenticated users to login with from param", async ({ page }) => {
    await page.context().clearCookies();

    await page.goto("/dashboard");
    await page.waitForURL(/\/login/);

    expect(page.url()).toContain("/login");
    expect(page.url()).toContain("from=%2Fdashboard");
  });

  test("redirects authenticated users from auth routes to dashboard", async ({ page }) => {
    // storageState from setup means we're authenticated
    await page.goto("/login");

    await page.waitForURL("/dashboard");
    expect(page.url()).toContain("/dashboard");
  });

  test("allows authenticated access to dashboard", async ({ dashboardPage }) => {
    await dashboardPage.goto();

    await expect(dashboardPage.heading).toBeVisible();
    await expect(dashboardPage.userEmail).toBeVisible();
  });
});
