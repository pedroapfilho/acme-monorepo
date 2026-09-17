import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

export class ResetPasswordPage {
  private readonly heading: Locator;
  private readonly invalidLinkHeading: Locator;
  private readonly requestNewLink: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByText("Reset your password", { exact: true });
    this.invalidLinkHeading = page.getByRole("heading", { name: "Reset link invalid" });
    this.requestNewLink = page.getByRole("link", { name: "Request a new link" });
    this.passwordInput = page.getByLabel("New password", { exact: true });
    this.confirmPasswordInput = page.getByLabel(/confirm password/iv);
    this.submitButton = page.getByRole("button", { name: /reset password/iv });
  }

  goto = async (token?: string) => {
    const path = token ? `/reset-password?token=${encodeURIComponent(token)}` : "/reset-password";
    await this.page.goto(path);
  };

  gotoRejected = async () => {
    await this.page.goto("/reset-password?error=INVALID_TOKEN");
  };

  submit = async (password: string, confirmPassword: string) => {
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.submitButton.click();
  };

  expectHeadingVisible = async () => {
    await expect(this.heading).toBeVisible();
  };

  expectInvalidLinkVisible = async () => {
    await expect(this.invalidLinkHeading).toBeVisible();
    await expect(this.requestNewLink).toHaveAttribute("href", "/recover");
    await expect(this.passwordInput).toHaveCount(0);
  };
}
