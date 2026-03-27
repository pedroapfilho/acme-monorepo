import { mkdirSync } from "node:fs";

import { expect, test as setup } from "@playwright/test";

import { apiUrl } from "../../../playwright.config";

const TEST_USER = {
  email: "e2e-test@acme.localhost",
  name: "E2E Test User",
  password: "TestPassword123!",
};

setup("create and authenticate test user", async ({ page, request }) => {
  // Ensure .auth directory exists (fresh CI checkout won't have it)
  mkdirSync("tests/e2e/.auth", { recursive: true });

  // Seed user via Better Auth API (201 created or 409 conflict are both OK)
  const signUpResponse = await request.post(`${apiUrl}/auth/sign-up/email`, {
    data: {
      email: TEST_USER.email,
      name: TEST_USER.name,
      password: TEST_USER.password,
    },
  });
  expect([200, 201, 409, 422]).toContain(signUpResponse.status());

  // Authenticate via the login page to get session cookies
  await page.goto("/login");
  await page.getByLabel("Email").fill(TEST_USER.email);
  await page.getByLabel("Password").fill(TEST_USER.password);
  await page.getByRole("button", { name: "Log In" }).click();

  await page.waitForURL("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  // Persist auth state for browser projects
  await page.context().storageState({ path: "tests/e2e/.auth/user.json" });
});
