import { expect, test } from "../fixtures/auth.fixture";
import { signIn } from "../fixtures/session";
import { verificationLink } from "../fixtures/verification.fixture";

test.describe("Change email (two-stage confirmation + verification)", { tag: "@email" }, () => {
  test("user changes email: both stage-1 and stage-2 mails leave Resend, new email signs in", async ({
    account,
    page,
    request,
    settingsPage,
  }) => {
    const newEmail = account.email.replace("delivered+", "delivered+new-");
    const sinceMs = Date.now();

    await settingsPage.goto();
    await settingsPage.changeEmail(newEmail);
    await settingsPage.expectEmailConfirmationSentTo(account.email);

    await page.goto(
      await verificationLink({ sinceMs, subject: /confirm|change/iv, to: account.email }),
    );
    await page.waitForURL("/dashboard/settings");

    await page.goto(await verificationLink({ sinceMs, to: newEmail }));
    await page.waitForURL("/dashboard/settings");
    await settingsPage.expectSignedInAs(newEmail);

    await expect(await signIn(request, account)).not.toBeOK();
    await expect(await signIn(request, { ...account, email: newEmail })).toBeOK();
  });
});
