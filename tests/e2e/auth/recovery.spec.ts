import { test, expect } from "../fixtures/auth.fixture";

test.describe("Password Recovery", () => {
  test("submits recovery form and redirects to login", async ({ page, recoverPage }) => {
    await page.context().clearCookies();

    await recoverPage.goto();
    await recoverPage.requestReset("e2e-test@acme.localhost");

    await page.waitForURL(/\/login\?message=password-reset-sent/);
    expect(page.url()).toContain("message=password-reset-sent");
  });

  test("shows validation error for invalid email", async ({ page, recoverPage }) => {
    await page.context().clearCookies();

    await recoverPage.goto();
    await recoverPage.requestReset("not-an-email");

    await expect(page.getByText(/invalid/i)).toBeVisible();
    expect(page.url()).toContain("/recover");
  });
});
