import { test, expect } from "@playwright/test";

const testEmail = `test-${Date.now()}@example.com`;
const testPassword = "TestPassword123!";
const testUsername = `testuser${Date.now()}`;

test.describe("Authentication Flow", () => {
  test("should complete full authentication flow", async ({ page }) => {
    // 1. Visit registration page
    await page.goto("/register");

    // 2. Fill registration form
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="username"]', testUsername);

    // 3. Submit registration
    await page.click('button[type="submit"]');

    // 4. Should redirect to dashboard after successful registration
    await page.waitForURL("/dashboard");
    expect(page.url()).toContain("/dashboard");

    // 5. Verify user is logged in by checking for dashboard content
    await expect(page.locator("h1")).toContainText("Dashboard");

    // 6. Test logout
    await page.click('button:has-text("Sign out")');
    await page.waitForURL("/");

    // 7. Test login with email
    await page.goto("/login");
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // 8. Should redirect to dashboard
    await page.waitForURL("/dashboard");
    expect(page.url()).toContain("/dashboard");

    // 9. Logout again
    await page.click('button:has-text("Sign out")');
    await page.waitForURL("/");

    // 10. Test login with username
    await page.goto("/login");
    await page.fill('input[name="email"]', testUsername);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // 11. Should redirect to dashboard
    await page.waitForURL("/dashboard");
    expect(page.url()).toContain("/dashboard");
  });

  test("should protect routes when not authenticated", async ({ page }) => {
    // Clear cookies to ensure we're logged out
    await page.context().clearCookies();

    // Try to access protected route
    await page.goto("/dashboard");

    // Should redirect to login
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
    expect(page.url()).toContain("from=%2Fdashboard");
  });

  test("should redirect to dashboard if already logged in", async ({
    page,
  }) => {
    // First login
    await page.goto("/login");
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");

    // Try to access login page while logged in
    await page.goto("/login");

    // Should redirect to dashboard
    await page.waitForURL("/dashboard");
    expect(page.url()).toContain("/dashboard");
  });

  test("should handle invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', "WrongPassword");
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator("text=/invalid/i")).toBeVisible();

    // Should stay on login page
    expect(page.url()).toContain("/login");
  });

  test("should validate password requirements", async ({ page }) => {
    await page.goto("/register");

    // Try with short password
    await page.fill('input[name="email"]', `short-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', "short");
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="username"]', `short${Date.now()}`);
    await page.click('button[type="submit"]');

    // Should show error about password length
    await expect(page.locator("text=/at least 12 characters/i")).toBeVisible();

    // Should stay on register page
    expect(page.url()).toContain("/register");
  });

  test("should access protected API route with session", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");

    // Make API request to protected route
    const response = await page.request.get("/api/protected/test");
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.user.email).toBe(testEmail);
  });

  test("should reject protected API route without session", async ({
    page,
  }) => {
    // Clear cookies to ensure we're logged out
    await page.context().clearCookies();

    // Make API request to protected route
    const response = await page.request.get("/api/protected/test");
    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data.error).toBe("Unauthorized");
  });
});
