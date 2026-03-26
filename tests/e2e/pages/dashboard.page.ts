import type { Locator, Page } from "@playwright/test";

export class DashboardPage {
  readonly heading: Locator;
  readonly signOutButton: Locator;
  readonly userEmail: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole("heading", { name: "Dashboard" });
    this.signOutButton = page.getByRole("button", { name: "Sign Out" });
    this.userEmail = page.locator("text=You are logged in as:");
  }

  goto = async () => {
    await this.page.goto("/dashboard");
  };

  signOut = async () => {
    await this.signOutButton.click();
  };
}
