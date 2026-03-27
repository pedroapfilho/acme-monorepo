import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

export class DashboardPage {
  private readonly heading: Locator;
  private readonly signOutButton: Locator;
  private readonly userEmail: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole("heading", { name: /dashboard/i });
    this.signOutButton = page.getByRole("button", { name: /sign out/i });
    this.userEmail = page.getByText(/you are logged in as/i);
  }

  goto = async () => {
    await this.page.goto("/dashboard");
  };

  signOut = async () => {
    await this.signOutButton.click();
  };

  expectHeadingVisible = async () => {
    await expect(this.heading).toBeVisible();
  };

  expectUserEmailVisible = async () => {
    await expect(this.userEmail).toBeVisible();
  };
}
