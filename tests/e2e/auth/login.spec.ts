import { instant } from "@next/playwright";

import { test, expect } from "../fixtures/auth.fixture";
import { TEST_USER } from "../fixtures/test-user";

test.describe("Login", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("logs in with valid credentials", async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(TEST_USER.email, TEST_USER.password);

    await page.waitForURL("/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("shows error for wrong password", async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(TEST_USER.email, "WrongPassword!!");

    await loginPage.expectErrorVisible();
    expect(page.url()).toContain("/login");
  });

  test("shows validation error for invalid email", async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login("not-an-email", TEST_USER.password);

    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  test("shows the login shell on an initial load", async ({ baseURL, page }) => {
    await instant(
      page,
      async () => {
        await page.goto("/login");
        await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
        await expect(page.getByLabel("Email")).toBeVisible();
      },
      { baseURL },
    );
  });

  test("shows the destination shell during client navigation", async ({ page }) => {
    await page.goto("/recover");

    await instant(page, async () => {
      await page.getByRole("link", { name: "Sign in" }).click();
      await page.waitForURL("/login");
      await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
      await expect(page.getByLabel("Email")).toBeVisible();
    });
  });
});

test.describe("Login (already authenticated)", () => {
  test("redirects to dashboard if already authenticated", async ({ page }) => {
    await page.goto("/login");

    await page.waitForURL("/dashboard");
    expect(page.url()).toContain("/dashboard");
  });
});
