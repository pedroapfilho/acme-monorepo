import { prisma } from "@repo/db";
import { expect, test } from "@playwright/test";

import { webUrl } from "../../../playwright.config";
import { verification } from "../fixtures/verification.fixture";
import { makeTestEmail } from "../helpers/test-email";

test.skip(!process.env.RESEND_API_KEY, "needs RESEND_API_KEY (test mode)");

test.describe("Change email (two-stage confirmation + verification)", () => {
  test("user changes email to a new address and signs in with the new one", async ({
    page,
    request,
  }, testInfo) => {
    await page.context().clearCookies();

    const currentEmail = makeTestEmail(testInfo).toLowerCase();
    const newEmail = makeTestEmail(testInfo)
      .toLowerCase()
      .replace("delivered+", "delivered+new-");
    const password = "ChangeEmailPwd1!";

    // Seed + verify a user, then sign in to get a session.
    const signUp = await request.post(`${webUrl}/api/auth/sign-up/email`, {
      data: { email: currentEmail, name: "Change Me", password },
    });
    expect([200, 201]).toContain(signUp.status());
    const verify = await verification.forVerifyEmail(currentEmail);
    await page.goto(verify.url);
    await page.waitForURL("/dashboard");

    // Reuse the existing browser context's session cookie for the API call.
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

    const change = await request.post(`${webUrl}/api/auth/change-email`, {
      data: { newEmail },
      headers: { Cookie: cookieHeader },
    });
    expect(change.status()).toBe(200);

    const { confirmationUrl, verificationUrl } = await verification.forChangeEmail(
      currentEmail,
      newEmail,
    );

    // Stage 1 — current-mailbox owner consents. Better Auth's verify-email
    // handler issues stage-2 internally and redirects to callbackURL.
    await page.goto(confirmationUrl);
    await page.waitForURL("/dashboard");

    // Stage 2 — new-mailbox owner proves access. This is the call that
    // actually updates the user record.
    await page.goto(verificationUrl);
    await page.waitForURL("/dashboard");

    // DB now reflects the new email. The user row count is unchanged.
    const updated = await prisma.user.findUnique({ where: { email: newEmail } });
    expect(updated).not.toBeNull();
    const stale = await prisma.user.findUnique({ where: { email: currentEmail } });
    expect(stale).toBeNull();

    // Old email no longer authenticates.
    await page.context().clearCookies();
    const oldLogin = await request.post(`${webUrl}/api/auth/sign-in/email`, {
      data: { email: currentEmail, password },
    });
    expect(oldLogin.status()).toBeGreaterThanOrEqual(400);

    // New email does.
    await page.goto("/login");
    await page.getByLabel("Email").fill(newEmail);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });
});
