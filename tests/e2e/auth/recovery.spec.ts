import { test, expect } from "../fixtures/auth.fixture";

test.describe("Password Recovery", () => {
  test("submits recovery form and shows inline success state", async ({ page, recoverPage }) => {
    await page.context().clearCookies();

    await recoverPage.goto();
    await recoverPage.requestReset("e2e-test@acme.localhost");

    await expect(page.getByText("Check your email")).toBeVisible();
    await expect(page.getByText("e2e-test@acme.localhost")).toBeVisible();
    expect(page.url()).toContain("/recover");
  });

  test("shows validation error for invalid email", async ({ page, recoverPage }) => {
    await page.context().clearCookies();

    await recoverPage.goto();
    await recoverPage.requestReset("not-an-email");

    // Validation error renders in an alert slot, not Sonner.
    await expect(page.getByText(/valid email/i).first()).toBeVisible();
    expect(page.url()).toContain("/recover");
  });
});
