import { expect, test } from "@playwright/test";

import { webUrl } from "../../../playwright.config";
import { verification } from "../fixtures/verification.fixture";
import { extractLink, waitForEmail } from "../helpers/resend";
import { makeTestEmail, makeTestUsername } from "../helpers/test-email";

test.skip(!process.env.RESEND_API_KEY, "needs RESEND_API_KEY (test mode)");

test.use({ storageState: { cookies: [], origins: [] } });

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

    // Welcome email isn't under test — use JWT reconstruction.
    const signUp = await request.post(`${webUrl}/api/auth/sign-up/email`, {
      data: { email, name: "Reset Me", password: originalPassword, username },
    });
    expect([200, 201]).toContain(signUp.status());
    const verify = await verification.forVerifyEmail(email);
    await page.goto(verify.url);
    await page.context().clearCookies();

    // Pin cutoff AFTER the welcome email so the reset-mail search doesn't match it.
    const since = Date.now();

    // Always 200 (enumeration prevention) regardless of whether the email exists.
    const reset = await request.post(`${webUrl}/api/auth/request-password-reset`, {
      data: { email, redirectTo: "/reset-password" },
    });
    expect(reset.status()).toBe(200);

    const mail = await waitForEmail({
      sinceMs: since,
      subject: /reset/i,
      to: email,
    });
    expect(mail.last_event).not.toBe("bounced");

    // Better Auth builds `/reset-password/<token>?callbackURL=...` (token is a path segment).
    const resetUrl = extractLink(mail, /\/reset-password\/[^"?]+\?callbackURL=/v);
    await page.goto(resetUrl);

    await page.getByLabel("New password", { exact: true }).fill(newPassword);
    await page.getByLabel(/confirm password/i).fill(newPassword);
    await page.getByRole("button", { name: /reset password/i }).click();

    await page.waitForURL(/\/login/);

    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(newPassword);
    await page.getByRole("button", { name: "Sign in" }).click();

    await page.waitForURL("/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });
});
