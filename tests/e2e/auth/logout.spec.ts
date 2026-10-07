import { test } from "../fixtures/auth.fixture";
import { TEST_USER } from "../fixtures/test-user";

test.describe("Logout", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ dashboardPage, loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(TEST_USER.email, TEST_USER.password);
    await page.waitForURL("/dashboard");
    await dashboardPage.expectHeadingVisible();
  });

  test("signs out and redirects to login", async ({ dashboardPage, page }) => {
    await dashboardPage.signOut();

    await page.waitForURL("/login");
  });

  test("cannot access dashboard after logout", async ({ dashboardPage, page }) => {
    await dashboardPage.signOut();
    await page.waitForURL("/login");

    await dashboardPage.goto();
    await page.waitForURL(/\/login/v);
  });
});
