import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

export class RecoverPage {
  private readonly emailInput: Locator;
  private readonly submitButton: Locator;
  private readonly rootError: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByLabel(/email/i);
    this.submitButton = page.getByRole("button", { name: /send reset link/i });
    // Root errors render in a <p class="text-destructive"> sibling, not Sonner.
    this.rootError = page.locator("p.text-destructive");
  }

  goto = async () => {
    await this.page.goto("/recover");
  };

  requestReset = async (email: string) => {
    await this.emailInput.fill(email);
    await this.submitButton.click();
  };

  expectErrorVisible = async () => {
    await expect(this.rootError).toBeVisible();
  };
}
