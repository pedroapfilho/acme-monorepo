import { expect, test } from "@playwright/test";

import { webUrl } from "../../../playwright.config";
import { extractLink, waitForEmail } from "../helpers/resend";
import { makeTestEmail, makeTestUsername } from "../helpers/test-email";

test.skip(!process.env.RESEND_API_KEY, "needs RESEND_API_KEY (test mode)");

test.use({ storageState: { cookies: [], origins: [] } });

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

    // Assert the verification email actually left Resend (not just that the JWT was valid).
    const mail = await waitForEmail({
      sinceMs: since,
      subject: /verify/i,
      to: email,
    });
    expect(mail.last_event).not.toBe("bounced");

    // Follow the link in a fresh context. autoSignInAfterVerification: true,
    // so the clicker tab/device gets a session cookie on the verification click.
    const verifyUrl = extractLink(mail, /\/api\/auth\/verify-email\?token=/v);
    const clickerContext = await browser.newContext();
    const clickerPage = await clickerContext.newPage();
    await clickerPage.goto(verifyUrl);
    await expect(clickerPage).toHaveURL(/\/verify-email\/success$/v);
    await expect(clickerPage.getByRole("heading", { name: "Email verified" })).toBeVisible();
    const clickerCookies = await clickerContext.cookies(webUrl);
    expect(clickerCookies.find((c) => c.name.startsWith("acme."))).toBeDefined();
    await clickerContext.close();

    // Independent sign-in (different device/context) also succeeds now that
    // the email is verified — the original signup tab can hit /login normally.
    const postSignIn = await request.post(`${webUrl}/api/auth/sign-in/email`, {
      data: { email, password },
    });
    expect(postSignIn.status()).toBe(200);
  });
});
