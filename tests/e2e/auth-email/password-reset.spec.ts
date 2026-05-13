import { expect, test } from "@playwright/test";

import { webUrl } from "../../../playwright.config";
import { verification } from "../fixtures/verification.fixture";
import { makeTestEmail } from "../helpers/test-email";

test.skip(!process.env.RESEND_API_KEY, "needs RESEND_API_KEY (test mode)");

test.describe("Password reset", () => {
  test("user can request reset, set a new password, and sign in", async ({
    page,
    request,
  }, testInfo) => {
    await page.context().clearCookies();

    const email = makeTestEmail(testInfo);
    const originalPassword = "OriginalPassword1!";
    const newPassword = "BrandNewPassword2!";

    // Seed a user via the API. Bypass verification by visiting the verify URL
    // directly — the reset flow itself doesn't require verified status, but a
    // user that exists.
    const signUp = await request.post(`${webUrl}/api/auth/sign-up/email`, {
      data: { email, name: "Reset Me", password: originalPassword },
    });
    expect([200, 201]).toContain(signUp.status());
    const verify = await verification.forVerifyEmail(email);
    await page.goto(verify.url);
    await page.context().clearCookies();

    // Request reset. Better Auth always returns 200 here (enumeration
    // prevention) regardless of whether the email exists.
    const reset = await request.post(`${webUrl}/api/auth/forget-password`, {
      data: { email, redirectTo: "/reset-password" },
    });
    expect(reset.status()).toBe(200);

    const { url } = await verification.forResetPassword(email);
    await page.goto(url);

    // The reset page reads token from query. fill new password.
    await page.getByLabel("New password", { exact: true }).fill(newPassword);
    await page.getByLabel(/confirm password/i).fill(newPassword);
    await page.getByRole("button", { name: /reset password/i }).click();

    // After reset, Better Auth lands the user back on /login (the form's
    // success path); old password should fail, new password should succeed.
    await page.waitForURL(/\/login/);

    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(newPassword);
    await page.getByRole("button", { name: "Sign in" }).click();

    await page.waitForURL("/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });
});
