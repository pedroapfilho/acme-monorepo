import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

export class RegisterPage {
  private readonly nameInput: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly submitButton: Locator;
  private readonly rootError: Locator;

  constructor(private readonly page: Page) {
    this.nameInput = page.getByLabel(/name/i);
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel("Password", { exact: true });
    this.confirmPasswordInput = page.getByLabel(/confirm password/i);
    this.submitButton = page.getByRole("button", { name: /register/i });
    this.rootError = page.locator(".text-red-500");
  }

  goto = async () => {
    await this.page.goto("/register");
  };

  register = async (name: string, email: string, password: string, confirmPassword: string) => {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.submitButton.click();
  };

  expectErrorVisible = async () => {
    await expect(this.rootError).toBeVisible();
  };

  expectErrorText = async (text: string | RegExp) => {
    await expect(this.rootError).toContainText(text);
  };
}
