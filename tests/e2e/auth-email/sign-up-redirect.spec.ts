import { expect, test } from "../fixtures/auth.fixture";
import { newCredentials } from "../fixtures/session";
import { verificationLink } from "../fixtures/verification.fixture";
import { DashboardPage } from "../pages/dashboard.page";
import { webUrl } from "../urls";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Sign-up with redirect context", { tag: "@email" }, () => {
  test("?from= survives signup and the verification link lands there signed in", async ({
    browser,
    registerPage,
  }, testInfo) => {
    const sinceMs = Date.now();
    const { email, name, password } = newCredentials(testInfo);
    const redirectPath = "/dashboard?welcome=e2e-redirect";

    await registerPage.goto(redirectPath);
    await registerPage.expectSignInLinkTo(`/login?from=${encodeURIComponent(redirectPath)}`);
    await registerPage.register(name, email, password, password);
    await registerPage.expectVerificationSentTo(email);

    const link = await verificationLink({ sinceMs, subject: /verify/iv, to: email });
    const clickerContext = await browser.newContext();
    const clickerPage = await clickerContext.newPage();
    await clickerPage.goto(link);
    await expect(clickerPage).toHaveURL(`${webUrl}${redirectPath}`);
    await new DashboardPage(clickerPage).expectHeadingVisible();
    await clickerContext.close();
  });
});
