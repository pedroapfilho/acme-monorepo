import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

export class SettingsPage {
  private readonly signedInAs: Locator;
  private readonly nameInput: Locator;
  private readonly saveNameButton: Locator;
  private readonly newEmailInput: Locator;
  private readonly updateEmailButton: Locator;
  private readonly emailChangeUnavailable: Locator;
  private readonly emailConfirmationSent: Locator;
  private readonly currentPasswordInput: Locator;
  private readonly newPasswordInput: Locator;
  private readonly confirmNewPasswordInput: Locator;
  private readonly updatePasswordButton: Locator;
  private readonly sessions: Locator;
  private readonly deletePasswordInput: Locator;
  private readonly deleteAccountButton: Locator;
  private readonly successToast: Locator;
  private readonly backToDashboardLink: Locator;

  constructor(private readonly page: Page) {
    this.signedInAs = page.getByText("Signed in as");
    this.nameInput = page.getByLabel("Full Name");
    this.saveNameButton = page.getByRole("button", { name: "Save" });
    this.newEmailInput = page.getByLabel("New email");
    this.updateEmailButton = page.getByRole("button", { name: "Update email" });
    this.emailChangeUnavailable = page.getByText(
      "Email changes are unavailable until email delivery is configured.",
    );
    this.emailConfirmationSent = page.getByRole("status").filter({ hasText: "Confirm the change" });
    this.currentPasswordInput = page.getByLabel("Current password");
    this.newPasswordInput = page.getByLabel("New password", { exact: true });
    this.confirmNewPasswordInput = page.getByLabel("Confirm new password");
    this.updatePasswordButton = page.getByRole("button", { name: "Update password" });
    this.sessions = page
      .locator('[data-slot="card"]')
      .filter({ has: page.getByRole("heading", { name: "Active sessions" }) })
      .getByRole("listitem");
    this.deletePasswordInput = page.getByLabel("Confirm with your password");
    this.deleteAccountButton = page.getByRole("button", { name: "Delete account" });
    this.successToast = page.locator('[data-sonner-toast][data-type="success"]');
    this.backToDashboardLink = page.getByRole("link", { name: "Back to dashboard" });
  }

  goto = async () => {
    await this.page.goto("/dashboard/settings");
  };

  backToDashboard = async () => {
    await this.backToDashboardLink.click();
    await this.page.waitForURL("/dashboard");
  };

  rename = async (name: string) => {
    await this.nameInput.fill(name);
    await this.saveNameButton.click();
  };

  changeEmail = async (email: string) => {
    await this.newEmailInput.fill(email);
    await this.updateEmailButton.click();
  };

  changePassword = async (currentPassword: string, newPassword: string) => {
    await this.currentPasswordInput.fill(currentPassword);
    await this.newPasswordInput.fill(newPassword);
    await this.confirmNewPasswordInput.fill(newPassword);
    await this.updatePasswordButton.click();
  };

  revokeSession = async (device: string) => {
    await this.sessions.filter({ hasText: device }).getByRole("button", { name: "Revoke" }).click();
  };

  deleteAccount = async (password: string) => {
    await this.deletePasswordInput.fill(password);
    await this.deleteAccountButton.click();
  };

  expectSignedInAs = async (email: string) => {
    await expect(this.signedInAs).toContainText(email);
  };

  expectSuccess = async (message: string) => {
    await expect(this.successToast).toContainText(message);
  };

  expectEmailChangeUnavailable = async () => {
    await expect(this.emailChangeUnavailable).toBeVisible();
    await expect(this.newEmailInput).toHaveCount(0);
  };

  expectEmailConfirmationSentTo = async (email: string) => {
    await expect(this.emailConfirmationSent).toContainText(email);
  };

  expectSessions = async (devices: Array<string>) => {
    await expect(this.sessions).toHaveCount(devices.length);
    for (const device of devices) {
      await expect(this.sessions.filter({ hasText: device })).toHaveCount(1);
    }
  };
}
