import { expect, test } from "@playwright/test";

import { landingUrl } from "../../../playwright.config";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Landing Page", () => {
  test("renders the home page", async ({ page }) => {
    await page.goto(landingUrl);

    await expect(page.locator("body")).not.toBeEmpty();
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("footer shows copyright", async ({ page }) => {
    await page.goto(landingUrl);

    const currentYear = new Date().getFullYear().toString();
    await expect(page.locator("footer")).toContainText(currentYear);
    await expect(page.locator("footer")).toContainText("Acme");
  });
});
