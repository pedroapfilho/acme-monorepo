import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

export class ResetPasswordPage {
  private readonly heading: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly submitButton: Locator;
  private readonly rootError: Locator;

  constructor(private readonly page: Page) {
    // CardTitle renders as <div>, not a semantic heading — match by text.
    this.heading = page.getByText("Reset your password", { exact: true });
    this.passwordInput = page.getByLabel("New password", { exact: true });
    this.confirmPasswordInput = page.getByLabel(/confirm password/iv);
    this.submitButton = page.getByRole("button", { name: /reset password/iv });
    // Root errors render via a <p class="text-sm text-destructive"> sibling.
    this.rootError = page.locator("p.text-destructive");
  }

  goto = async (token?: string) => {
    const path = token ? `/reset-password?token=${encodeURIComponent(token)}` : "/reset-password";
    await this.page.goto(path);
  };

  submit = async (password: string, confirmPassword: string) => {
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.submitButton.click();
  };

  expectHeadingVisible = async () => {
    await expect(this.heading).toBeVisible();
  };

  expectErrorText = async (text: string | RegExp) => {
    await expect(this.rootError).toContainText(text);
  };
}
