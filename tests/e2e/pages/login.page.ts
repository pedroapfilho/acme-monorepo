import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

export class LoginPage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  private readonly rootError: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByLabel(/email/iv);
    this.passwordInput = page.getByLabel(/password/iv);
    this.submitButton = page.getByRole("button", { name: /sign in|log in/iv });
    // Root errors render via a <p class="text-sm text-destructive"> sibling.
    this.rootError = page.locator("p.text-destructive");
  }

  goto = async () => {
    await this.page.goto("/login");
  };

  login = async (email: string, password: string) => {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  };

  expectErrorVisible = async () => {
    await expect(this.rootError).toBeVisible();
  };
}
