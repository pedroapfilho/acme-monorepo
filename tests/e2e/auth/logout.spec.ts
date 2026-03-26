import { test, expect } from "../fixtures/auth.fixture";

test.describe("Logout", () => {
  test("signs out and redirects to login", async ({ dashboardPage, page }) => {
    await dashboardPage.goto();
    await expect(dashboardPage.heading).toBeVisible();

    await dashboardPage.signOut();

    await page.waitForURL("/login");
    expect(page.url()).toContain("/login");
  });

  test("cannot access dashboard after logout", async ({ dashboardPage, page }) => {
    await dashboardPage.goto();
    await dashboardPage.signOut();
    await page.waitForURL("/login");

    await page.goto("/dashboard");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });
});
