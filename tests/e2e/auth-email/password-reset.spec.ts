import { expect, test } from "../fixtures/auth.fixture";
import { extractLink, waitForEmail } from "../helpers/resend";

test.describe("Password reset", { tag: "@email" }, () => {
  test("user can request reset, set a new password, and sign in", async ({
    account,
    dashboardPage,
    loginPage,
    page,
    recoverPage,
    resetPasswordPage,
  }) => {
    const newPassword = "BrandNewPassword2!";
    await page.context().clearCookies();
    const sinceMs = Date.now();

    await recoverPage.goto();
    await recoverPage.requestReset(account.email);
    await recoverPage.expectResetRequested(account.email);

    const mail = await waitForEmail({ sinceMs, subject: /reset/iv, to: account.email });
    expect(mail.last_event).not.toBe("bounced");
    await page.goto(extractLink(mail, /\/reset-password\/[^"?]+\?callbackURL=/v));
    await resetPasswordPage.submit(newPassword, newPassword);
    await page.waitForURL(/\/login/v);

    await loginPage.login(account.email, newPassword);
    await page.waitForURL("/dashboard");
    await dashboardPage.expectHeadingVisible();
  });
});
