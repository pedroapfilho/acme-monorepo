import { expect, test } from "@playwright/test";

import { webUrl } from "../../../playwright.config";
import { extractLink, waitForEmail } from "../helpers/resend";
import { makeTestEmail, makeTestUsername } from "../helpers/test-email";

test.skip(!process.env.RESEND_API_KEY, "needs RESEND_API_KEY (test mode)");

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Sign-up email verification", () => {
  test("verify email is sent, clicking the link signs in the clicking device", async ({
    browser,
    request,
  }, testInfo) => {
    const since = Date.now();
    const email = makeTestEmail(testInfo);
    const username = makeTestUsername(email);
    const password = "SecurePassword1!";

    const signUp = await request.post(`${webUrl}/api/auth/sign-up/email`, {
      data: {
        email,
        name: "Verify Me",
        password,
        username,
      },
    });
    expect([200, 201]).toContain(signUp.status());

    // Better Auth blocks unverified users — no session cookie before verify.
    const preSignIn = await request.post(`${webUrl}/api/auth/sign-in/email`, {
      data: { email, password },
      failOnStatusCode: false,
    });
    expect(preSignIn.status()).not.toBe(200);

    const mail = await waitForEmail({
      sinceMs: since,
      subject: /verify/i,
      to: email,
    });
    expect(mail.last_event).not.toBe("bounced");

    // Fresh context: the verify link mints a session on the clicking device (autoSignInAfterVerification).
    const verifyUrl = extractLink(mail, /\/api\/auth\/verify-email\?token=/v);
    const clickerContext = await browser.newContext();
    const clickerPage = await clickerContext.newPage();
    await clickerPage.goto(verifyUrl);
    await expect(clickerPage).toHaveURL(/\/dashboard$/v);
    const clickerCookies = await clickerContext.cookies(webUrl);
    expect(clickerCookies.find((c) => c.name.startsWith("acme."))).toBeDefined();
    await clickerContext.close();

    const postSignIn = await request.post(`${webUrl}/api/auth/sign-in/email`, {
      data: { email, password },
    });
    expect(postSignIn.status()).toBe(200);
  });
});
