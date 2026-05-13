import { expect, test } from "@playwright/test";

import { webUrl } from "../../../playwright.config";
import { verification } from "../fixtures/verification.fixture";
import { makeTestEmail, makeTestUsername } from "../helpers/test-email";

// Skip the whole suite when Resend isn't configured. Without RESEND_API_KEY,
// the auth server runs with requireEmailVerification: false, which is a
// different code path — these tests would assert against the wrong behavior.
test.skip(!process.env.RESEND_API_KEY, "needs RESEND_API_KEY (test mode)");

test.describe("Sign-up email verification", () => {
  test("user can sign up, click the verification link, and reach /dashboard", async ({
    page,
    request,
  }, testInfo) => {
    await page.context().clearCookies();

    const email = makeTestEmail(testInfo);
    const username = makeTestUsername(email);
    const password = "SecurePassword1!";

    const signUp = await request.post(`${webUrl}/api/auth/sign-up/email`, {
      data: { email, name: "Verify Me", password, username },
    });
    // 200/201 with requireEmailVerification:true. Better Auth returns user
    // shape but no session cookie — confirmed by the redirect below.
    expect([200, 201]).toContain(signUp.status());

    // Pre-verification: visiting /dashboard bounces to /login.
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);

    const { url } = await verification.forVerifyEmail(email);
    await page.goto(url);

    // verify-email handler redirects to callbackURL (=/dashboard) and sets
    // a session cookie. End state: authenticated, on /dashboard.
    await page.waitForURL("/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });
});
