import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

export class RecoverPage {
  private readonly emailInput: Locator;
  private readonly submitButton: Locator;
  private readonly resetRequested: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByLabel(/email/iv);
    this.submitButton = page.getByRole("button", { name: /send reset link/iv });
    this.resetRequested = page.getByText("Check your email");
  }

  goto = async () => {
    await this.page.goto("/recover");
  };

  requestReset = async (email: string) => {
    await this.emailInput.fill(email);
    await this.submitButton.click();
  };

  expectResetRequested = async (email: string) => {
    await expect(this.resetRequested).toBeVisible();
    await expect(this.page.getByText(email)).toBeVisible();
  };

  expectEmailError = async (message: RegExp) => {
    await expect(this.emailInput).toHaveAccessibleDescription(message);
  };
}
