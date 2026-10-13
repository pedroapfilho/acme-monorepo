import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

export class RegisterPage {
  private readonly nameInput: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly submitButton: Locator;
  private readonly signInLink: Locator;
  private readonly verificationSent: Locator;
  private readonly rootError: Locator;

  constructor(private readonly page: Page) {
    this.nameInput = page.getByLabel(/name/iv);
    this.emailInput = page.getByLabel(/email/iv);
    this.passwordInput = page.getByLabel("Password", { exact: true });
    this.confirmPasswordInput = page.getByLabel(/confirm password/iv);
    this.submitButton = page.getByRole("button", { name: /create account/iv });
    this.signInLink = page.getByRole("link", { name: /sign in/iv });
    this.verificationSent = page.getByRole("status").filter({ hasText: "Check your email" });
    this.rootError = page.locator('[data-sonner-toast][data-type="error"]');
  }

  goto = async (from?: string) => {
    await this.page.goto(
      from === undefined ? "/register" : `/register?from=${encodeURIComponent(from)}`,
    );
  };

  register = async (name: string, email: string, password: string, confirmPassword: string) => {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.submitButton.click();
  };

  expectSignInLinkTo = async (href: string) => {
    await expect(this.signInLink).toHaveAttribute("href", href);
  };

  expectVerificationSentTo = async (email: string) => {
    await expect(this.verificationSent).toContainText(email);
  };

  expectErrorVisible = async () => {
    await expect(this.rootError).toBeVisible();
  };
}
