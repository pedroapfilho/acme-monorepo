import { test, expect } from "../fixtures/auth.fixture";

test.describe("Reset Password", () => {
  test("renders the reset password form", async ({ page, resetPasswordPage }) => {
    await page.context().clearCookies();

    await resetPasswordPage.goto("any-token-value");

    await resetPasswordPage.expectHeadingVisible();
  });

  test("shows error when submitted without a token", async ({ page, resetPasswordPage }) => {
    await page.context().clearCookies();

    await resetPasswordPage.goto();
    await resetPasswordPage.submit("NewPassword123!", "NewPassword123!");

    await resetPasswordPage.expectErrorText(/invalid reset token/i);
    expect(page.url()).toContain("/reset-password");
  });

  test("shows error when passwords do not match", async ({ page, resetPasswordPage }) => {
    await page.context().clearCookies();

    await resetPasswordPage.goto("any-token-value");
    await resetPasswordPage.submit("NewPassword123!", "DifferentPassword1!");

    await resetPasswordPage.expectErrorText(/passwords do not match/i);
    expect(page.url()).toContain("/reset-password");
  });

  test("shows validation error for short password", async ({ page, resetPasswordPage }) => {
    await page.context().clearCookies();

    await resetPasswordPage.goto("any-token-value");
    await resetPasswordPage.submit("short", "short");

    await expect(page.getByText(/at least 12 characters/i).first()).toBeVisible();
    expect(page.url()).toContain("/reset-password");
  });

  test("rejects an invalid token at the auth server", async ({ page, resetPasswordPage }) => {
    await page.context().clearCookies();

    await resetPasswordPage.goto("definitely-not-a-real-token");
    await resetPasswordPage.submit("ValidPassword123!", "ValidPassword123!");

    // Better Auth rejects unknown tokens — the form surfaces the server message
    // (varies by version, but always renders into the destructive root error).
    await expect(page.locator("p.text-destructive")).toBeVisible();
    expect(page.url()).toContain("/reset-password");
  });
});
