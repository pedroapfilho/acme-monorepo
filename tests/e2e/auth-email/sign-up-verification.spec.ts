import { expect, test } from "@playwright/test";

import { webUrl } from "../../../playwright.config";
import { extractLink, waitForEmail } from "../helpers/resend";
import { makeTestEmail, makeTestUsername } from "../helpers/test-email";

// Skip the whole suite when Resend isn't configured. Without RESEND_API_KEY,
// the auth server runs with requireEmailVerification: false, which is a
// different code path — these tests would assert against the wrong behavior.
test.skip(!process.env.RESEND_API_KEY, "needs RESEND_API_KEY (test mode)");

test.describe("Sign-up email verification", () => {
  test("verify email is sent, link verifies the user, sign-in then succeeds", async ({
    browser,
    request,
  }, testInfo) => {
    const since = Date.now();
    const email = makeTestEmail(testInfo);
    const username = makeTestUsername(email);
    const password = "SecurePassword1!";

    const signUp = await request.post(`${webUrl}/api/auth/sign-up/email`, {
      data: {
        callbackURL: "/verify-email/success",
        email,
        name: "Verify Me",
        password,
        username,
      },
    });
    expect([200, 201]).toContain(signUp.status());

    // Pre-verification: signIn fails (Better Auth blocks unverified users)
    // and returns no session cookie.
    const preSignIn = await request.post(`${webUrl}/api/auth/sign-in/email`, {
      data: { email, password },
      failOnStatusCode: false,
    });
    expect(preSignIn.status()).not.toBe(200);

    // Assert the verification email actually left Resend. This is the
    // regression we care about: "JWT format was valid but the email never
    // sent" silently passed the old reconstruction-based path.
    const mail = await waitForEmail({
      sinceMs: since,
      subject: /verify/i,
      to: email,
    });
    expect(mail.last_event).not.toBe("bounced");

    // Pull the verification URL out of the rendered HTML and follow it in a
    // fresh BrowserContext (cross-device click). With
    // autoSignInAfterVerification: false, this lands on the success page
    // WITHOUT creating a session in the clicker context — the polling tab
    // elsewhere is the one that completes sign-in.
    const verifyUrl = extractLink(mail, /\/api\/auth\/verify-email\?token=/v);
    const clickerContext = await browser.newContext();
    const clickerPage = await clickerContext.newPage();
    await clickerPage.goto(verifyUrl);
    await expect(clickerPage).toHaveURL(/\/verify-email\/success$/v);
    await expect(clickerPage.getByRole("heading", { name: "Email verified" })).toBeVisible();
    const clickerCookies = await clickerContext.cookies(webUrl);
    expect(clickerCookies.find((c) => c.name.startsWith("acme."))).toBeUndefined();
    await clickerContext.close();

    // Original-tab path: signIn now succeeds. Polling client-side does this
    // continuously; the test just exercises the same code path once.
    const postSignIn = await request.post(`${webUrl}/api/auth/sign-in/email`, {
      data: { email, password },
    });
    expect(postSignIn.status()).toBe(200);
  });
});
