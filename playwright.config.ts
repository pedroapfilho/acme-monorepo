import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  reporter: "html",
  retries: process.env.CI ? 2 : 0,
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  webServer: [
    {
      command: "pnpm run dev --filter=web",
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      url: "http://localhost:3000",
    },
    {
      command: "pnpm run dev --filter=api",
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      url: "http://localhost:3001/healthz",
    },
  ],

  workers: process.env.CI ? 1 : undefined,
});
