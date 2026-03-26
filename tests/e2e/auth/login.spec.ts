import { test, expect } from "../fixtures/auth.fixture";

const TEST_USER = {
  email: "e2e-test@acme.localhost",
  password: "TestPassword123!",
};

test.describe("Login", () => {
  test("logs in with valid credentials", async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(TEST_USER.email, TEST_USER.password);

    await page.waitForURL("/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("shows error for wrong password", async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(TEST_USER.email, "WrongPassword!!");

    await expect(loginPage.rootError).toBeVisible();
    expect(page.url()).toContain("/login");
  });

  test("shows validation error for invalid email", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login("not-an-email", TEST_USER.password);

    await expect(loginPage.rootError).toBeVisible();
  });

  test("redirects to dashboard if already authenticated", async ({ page }) => {
    // storageState from setup means we're already logged in
    await page.goto("/login");

    await page.waitForURL("/dashboard");
    expect(page.url()).toContain("/dashboard");
  });
});
