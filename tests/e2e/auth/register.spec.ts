import { test, expect } from "../fixtures/auth.fixture";

// Skip flag for the two tests that assert the pre-Resend signup flow.
// With RESEND_API_KEY set, Better Auth runs in
// requireEmailVerification + enumeration-prevention mode: signup
// returns 200 without a session and lands on a verify-pending screen,
// and duplicate signups return synthetic success. The auth-email/*
// suite covers the Resend path end-to-end (delivery assertions
// included), so these UI assertions are moot when Resend is wired up.
const skipUnderResend = !!process.env.RESEND_API_KEY;

test.describe("Register", () => {
  test("registers with valid data", async ({ page, registerPage }) => {
    test.skip(skipUnderResend, "Resend-enabled flow is covered by auth-email/* specs");

    const uniqueEmail = `test-${Date.now()}@example.com`;

    // Clear storageState so we're not already logged in
    await page.context().clearCookies();

    await registerPage.goto();
    await registerPage.register("New User", uniqueEmail, "SecurePassword1!", "SecurePassword1!");

    await page.waitForURL("/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("shows error for existing email", async ({ page, registerPage }) => {
    test.skip(skipUnderResend, "Resend-enabled flow is covered by auth-email/* specs");

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

    // Both password and confirmPassword fields render the same length
    // error, so .first() avoids a strict-mode "resolved to 2 elements" violation.
    await expect(page.getByText(/at least 12 characters/i).first()).toBeVisible();
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

    // The inline error and the sonner toast both render "Passwords do
    // not match" — strict-mode needs `.first()` to pick one.
    await expect(page.getByText("Passwords do not match").first()).toBeVisible();
    expect(page.url()).toContain("/register");
  });

  test("redirects to dashboard if already authenticated", async ({ page }) => {
    await page.goto("/register");

    await page.waitForURL("/dashboard");
    expect(page.url()).toContain("/dashboard");
  });
});
