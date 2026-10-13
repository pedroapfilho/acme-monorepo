import { expect, test } from "../fixtures/auth.fixture";
import { newCredentials, signIn, signUp } from "../fixtures/session";
import { verificationLink } from "../fixtures/verification.fixture";
import { DashboardPage } from "../pages/dashboard.page";

test.describe("Sign-up email verification", { tag: "@email" }, () => {
  test("verify email is sent, clicking the link signs in the clicking device", async ({
    browser,
    request,
  }, testInfo) => {
    const sinceMs = Date.now();
    const credentials = newCredentials(testInfo);

    await expect(await signUp(request, credentials)).toBeOK();
    await expect(await signIn(request, credentials)).not.toBeOK();

    const link = await verificationLink({ sinceMs, subject: /verify/iv, to: credentials.email });
    const clickerContext = await browser.newContext();
    const clickerPage = await clickerContext.newPage();
    await clickerPage.goto(link);
    await expect(clickerPage).toHaveURL(/\/dashboard$/v);
    await new DashboardPage(clickerPage).expectHeadingVisible();
    await clickerContext.close();

    await expect(await signIn(request, credentials)).toBeOK();
  });
});
