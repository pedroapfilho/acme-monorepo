import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

export class LoginPage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  private readonly rootError: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByLabel(/email/iv);
    this.passwordInput = page.getByLabel("Password", { exact: true });
    this.submitButton = page.getByRole("button", { name: /sign in|log in/iv });
    this.rootError = page.locator('[data-slot="form-alert"]');
  }

  goto = async () => {
    await this.page.goto("/login");
  };

  login = async (email: string, password: string) => {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  };

  expectDisabled = async () => {
    await expect(this.emailInput).toBeDisabled();
    await expect(this.passwordInput).toBeDisabled();
    await expect(this.submitButton).toBeDisabled();
  };

  expectErrorVisible = async () => {
    await expect(this.rootError).toBeVisible();
  };
}
