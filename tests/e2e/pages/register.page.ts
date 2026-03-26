import type { Locator, Page } from "@playwright/test";

export class RegisterPage {
  private readonly nameInput: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly submitButton: Locator;
  readonly rootError: Locator;

  constructor(private readonly page: Page) {
    this.nameInput = page.getByLabel("Name");
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Password", { exact: true });
    this.confirmPasswordInput = page.getByLabel("Confirm Password");
    this.submitButton = page.getByRole("button", { name: "Register" });
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
}
