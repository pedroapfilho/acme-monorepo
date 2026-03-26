import type { Locator, Page } from "@playwright/test";

export class RecoverPage {
  private readonly emailInput: Locator;
  private readonly submitButton: Locator;
  readonly rootError: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByLabel("Email");
    this.submitButton = page.getByRole("button", { name: "Submit Request" });
    this.rootError = page.locator(".text-red-500");
  }

  goto = async () => {
    await this.page.goto("/recover");
  };

  requestReset = async (email: string) => {
    await this.emailInput.fill(email);
    await this.submitButton.click();
  };
}
