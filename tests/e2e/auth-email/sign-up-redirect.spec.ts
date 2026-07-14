import { expect, test } from "@playwright/test";

import { webUrl } from "../../../playwright.config";
import { extractLink, waitForEmail } from "../helpers/resend";
import { makeTestEmail } from "../helpers/test-email";

// Without RESEND_API_KEY, requireEmailVerification is off; these tests would hit the wrong code path.
test.skip(!process.env.RESEND_API_KEY, "needs RESEND_API_KEY (test mode)");

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Sign-up with redirect context", () => {
  test("?from= survives signup and the verification link lands there signed in", async ({
    browser,
    page,
  }, testInfo) => {
    const since = Date.now();
    const email = makeTestEmail(testInfo);
    // Query marker proves ?from= carried through; bare /dashboard is the validator fallback.
    const redirectPath = "/dashboard?welcome=e2e-redirect";

    // Form wiring passes callbackURL; the API would accept any value.
    await page.goto(`${webUrl}/register?from=${encodeURIComponent(redirectPath)}`);

    await expect(page.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      `/login?from=${encodeURIComponent(redirectPath)}`,
    );

    await page.getByLabel("Full Name").fill("Redirect Me");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("SecurePassword1!");
    await page.getByLabel("Confirm Password").fill("SecurePassword1!");
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.getByText(/check your email/i)).toBeVisible({ timeout: 10_000 });

    const mail = await waitForEmail({
      sinceMs: since,
      subject: /verify/i,
      to: email,
    });
    expect(mail.last_event).not.toBe("bounced");

    const verifyUrl = extractLink(mail, /\/api\/auth\/verify-email\?token=/v);
    const clickerContext = await browser.newContext();
    const clickerPage = await clickerContext.newPage();
    await clickerPage.goto(verifyUrl);
    await expect(clickerPage).toHaveURL(`${webUrl}${redirectPath}`);
    const clickerCookies = await clickerContext.cookies(webUrl);
    expect(clickerCookies.find((c) => c.name.startsWith("acme."))).toBeDefined();
    await clickerContext.close();
  });
});
