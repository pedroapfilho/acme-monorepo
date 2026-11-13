import { test, expect } from "../fixtures/auth.fixture";

test.describe("Register", () => {
  test("shows error for short password", async ({ page, registerPage }) => {
    await page.context().clearCookies();

    await registerPage.goto();
    await registerPage.register("Short Pass", `short-${Date.now()}@example.com`, "short", "short");

    await expect(page.getByText("Password must be at least 12 characters").first()).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeFocused();
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

    await expect(page.getByText("Passwords do not match").first()).toBeVisible();
    expect(page.url()).toContain("/register");
  });

  test("redirects to dashboard if already authenticated", async ({ page }) => {
    await page.goto("/register");

    await page.waitForURL("/dashboard");
    expect(page.url()).toContain("/dashboard");
  });
});
