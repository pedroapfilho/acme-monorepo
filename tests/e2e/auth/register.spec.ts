import { test, expect } from "../fixtures/auth.fixture";

test.describe("Register", () => {
  test("registers with valid data", async ({ page, registerPage }) => {
    const uniqueEmail = `test-${Date.now()}@example.com`;

    // Clear storageState so we're not already logged in
    await page.context().clearCookies();

    await registerPage.goto();
    await registerPage.register("New User", uniqueEmail, "SecurePassword1!", "SecurePassword1!");

    await page.waitForURL("/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("shows error for existing email", async ({ page, registerPage }) => {
    await page.context().clearCookies();

    await registerPage.goto();
    await registerPage.register(
      "Duplicate User",
      "e2e-test@acme.localhost",
      "SecurePassword1!",
      "SecurePassword1!",
    );

    await registerPage.expectErrorVisible();
    expect(page.url()).toContain("/register");
  });

  test("shows error for short password", async ({ page, registerPage }) => {
    await page.context().clearCookies();

    await registerPage.goto();
    await registerPage.register("Short Pass", `short-${Date.now()}@example.com`, "short", "short");

    await expect(page.getByText(/at least 12 characters/i)).toBeVisible();
    expect(page.url()).toContain("/register");
  });

  test("shows error for mismatched passwords", async ({ page, registerPage }) => {
    await page.context().clearCookies();

    await registerPage.goto();
    await registerPage.register(
      "Mismatch User",
      `mismatch-${Date.now()}@example.com`,
      "SecurePassword1!",
      "DifferentPassword!",
    );

    await registerPage.expectErrorText("Passwords do not match");
    expect(page.url()).toContain("/register");
  });

  test("redirects to dashboard if already authenticated", async ({ page }) => {
    await page.goto("/register");

    await page.waitForURL("/dashboard");
    expect(page.url()).toContain("/dashboard");
  });
});
