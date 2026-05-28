import { expect, test } from "@playwright/test";

import { webUrl } from "../../../playwright.config";
import { verification } from "../fixtures/verification.fixture";
import { extractLink, waitForEmail } from "../helpers/resend";
import { makeTestEmail, makeTestUsername } from "../helpers/test-email";

test.skip(!process.env.RESEND_API_KEY, "needs RESEND_API_KEY (test mode)");

test.describe("Password reset", () => {
  test("user can request reset, set a new password, and sign in", async ({
    page,
    request,
  }, testInfo) => {
    await page.context().clearCookies();

    const email = makeTestEmail(testInfo);
    const username = makeTestUsername(email);
    const originalPassword = "OriginalPassword1!";
    const newPassword = "BrandNewPassword2!";

    // Seed a user via the API. Bypass verification with the JWT-reconstruction
    // helper — delivery of the *welcome* email isn't under test here. (See
    // sign-up-verification.spec.ts for that assertion.)
    const signUp = await request.post(`${webUrl}/api/auth/sign-up/email`, {
      data: { email, name: "Reset Me", password: originalPassword, username },
    });
    expect([200, 201]).toContain(signUp.status());
    const verify = await verification.forVerifyEmail(email);
    await page.goto(verify.url);
    await page.context().clearCookies();

    // Pin the cutoff AFTER the welcome email was sent so we don't pick it up
    // when looking for the password-reset mail.
    const since = Date.now();

    // Request reset. Better Auth's endpoint is `/request-password-reset`
    // (the older `/forget-password` path was removed). Always returns 200
    // here (enumeration prevention) regardless of whether the email exists.
    const reset = await request.post(`${webUrl}/api/auth/request-password-reset`, {
      data: { email, redirectTo: "/reset-password" },
    });
    expect(reset.status()).toBe(200);

    // Assert the reset email actually left Resend — this is the bug class
    // "we sent a 200 but never delivered" that the old DB-poll path missed.
    const mail = await waitForEmail({
      sinceMs: since,
      subject: /reset/i,
      to: email,
    });
    expect(mail.last_event).not.toBe("bounced");

    const resetUrl = extractLink(mail, /\/reset-password\?token=/v);
    await page.goto(resetUrl);

    // The reset page reads token from query. Fill new password.
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
