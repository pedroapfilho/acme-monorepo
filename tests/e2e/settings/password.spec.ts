import { expect, test } from "@playwright/test";

import { holdScripts } from "../helpers/hold-scripts";

test.describe("Settings password form", () => {
  test("keeps the form disabled until it hydrates", async ({ page }) => {
    const currentPassword = page.getByLabel("Current password");
    const newPassword = page.getByLabel("New password", { exact: true });
    const confirmPassword = page.getByLabel("Confirm new password");
    const submitButton = page.getByRole("button", { includeHidden: true, name: "Update password" });

    const releaseScripts = await holdScripts(page);
    await page.goto("/dashboard/settings", { waitUntil: "commit" });
    await expect(currentPassword).toBeDisabled();
    await expect(newPassword).toBeDisabled();
    await expect(confirmPassword).toBeDisabled();
    await expect(submitButton).toBeDisabled();

    releaseScripts();
    await currentPassword.fill("NotTheCurrentPassword1!");
    await newPassword.fill("AnotherPassword123!");
    await confirmPassword.fill("AnotherPassword123!");
    await submitButton.click();

    await expect(page.locator('[data-sonner-toast][data-type="error"]')).toBeVisible();
  });
});
