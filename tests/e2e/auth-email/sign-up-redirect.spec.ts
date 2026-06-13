import { expect, test } from "@playwright/test";

import { webUrl } from "../../../playwright.config";
import { extractLink, waitForEmail } from "../helpers/resend";
import { makeTestEmail } from "../helpers/test-email";

// Skip the whole suite when Resend isn't configured. Without RESEND_API_KEY,
// the auth server runs with requireEmailVerification: false, which is a
// different code path — these tests would assert against the wrong behavior.
test.skip(!process.env.RESEND_API_KEY, "needs RESEND_API_KEY (test mode)");

// Registration tests need a clean auth state.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Sign-up with redirect context", () => {
  test("?from= survives signup and the verification link lands there signed in", async ({
    browser,
    page,
  }, testInfo) => {
    const since = Date.now();
    const email = makeTestEmail(testInfo);
    // /dashboard is the only protected page in acme, and it's also the
    // validator's fallback — the query marker is what proves the param
    // actually carried through (the fallback is bare /dashboard).
    const redirectPath = "/dashboard?welcome=e2e-redirect";

    // Drive the actual form: this is what validates the param and passes it
    // as callbackURL in the signUp.email body (the API would accept any
    // callbackURL — the form wiring is what's under test).
    await page.goto(`${webUrl}/register?from=${encodeURIComponent(redirectPath)}`);

    // The login cross-link carries the context, so switching forms wouldn't
    // drop it.
    await expect(page.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      `/login?from=${encodeURIComponent(redirectPath)}`,
    );

    await page.getByLabel("Full Name").fill("Redirect Me");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("SecurePassword1!");
    await page.getByLabel("Confirm Password").fill("SecurePassword1!");
    await page.getByRole("button", { name: /create account/i }).click();

    // requireEmailVerification suppresses auto-sign-in: the form shows the
    // inline check-your-email state instead of navigating.
    await expect(page.getByText(/check your email/i)).toBeVisible({ timeout: 10_000 });

    const mail = await waitForEmail({
      sinceMs: since,
      subject: /verify/i,
      to: email,
    });
    expect(mail.last_event).not.toBe("bounced");

    // The link IS the login: autoSignInAfterVerification mints a session on
    // the clicking device, and the callbackURL from the signup body sends
    // the clicker back to the page that started the flow — not the server
    // default "/".
    const verifyUrl = extractLink(mail, /\/api\/auth\/verify-email\?token=/v);
    const clickerContext = await browser.newContext();
    const clickerPage = await clickerContext.newPage();
    await clickerPage.goto(verifyUrl);
    // /dashboard redirects unauthenticated visitors to /login, so holding
    // this URL also proves the clicker device is signed in.
    await expect(clickerPage).toHaveURL(`${webUrl}${redirectPath}`);
    const clickerCookies = await clickerContext.cookies(webUrl);
    expect(clickerCookies.find((c) => c.name.startsWith("acme."))).toBeDefined();
    await clickerContext.close();
  });
});
