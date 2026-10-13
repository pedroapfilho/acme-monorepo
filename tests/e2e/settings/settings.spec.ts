import { expect, test } from "../fixtures/auth.fixture";
import { signIn } from "../fixtures/session";

const OTHER_DEVICE = "E2E other device";

test.describe("Settings", () => {
  test.beforeEach(async ({ account, settingsPage }) => {
    await settingsPage.goto();
    await settingsPage.expectSignedInAs(account.email);
  });

  test("renames the profile", async ({ dashboardPage, settingsPage }) => {
    await settingsPage.rename("Renamed Account");
    await settingsPage.expectSuccess("Profile updated");

    await settingsPage.backToDashboard();
    await dashboardPage.expectGreeting("Renamed Account");
  });

  test(
    "explains that email changes need email delivery",
    { tag: "@no-email" },
    async ({ settingsPage }) => {
      await settingsPage.expectEmailChangeUnavailable();
    },
  );

  test("changes the password", async ({ account, request, settingsPage }) => {
    const newPassword = "ChangedPassword123!";

    await settingsPage.changePassword(account.password, newPassword);
    await settingsPage.expectSuccess("Password updated");

    await expect(await signIn(request, account)).not.toBeOK();
    await expect(await signIn(request, { ...account, password: newPassword })).toBeOK();
  });

  test("lists active sessions and revokes another device", async ({
    account,
    page,
    playwright,
    settingsPage,
  }) => {
    const otherDevice = await playwright.request.newContext({ userAgent: OTHER_DEVICE });
    await expect(await signIn(otherDevice, account)).toBeOK();

    await page.reload();
    await settingsPage.expectSessions(["This device", OTHER_DEVICE]);

    await settingsPage.revokeSession(OTHER_DEVICE);
    await settingsPage.expectSessions(["This device"]);
    await page.reload();
    await settingsPage.expectSessions(["This device"]);
    await otherDevice.dispose();
  });

  test("deletes the account", async ({ account, page, request, settingsPage }) => {
    await settingsPage.deleteAccount(account.password);

    await page.waitForURL(/\/login/v);
    await expect(await signIn(request, account)).not.toBeOK();
  });
});
