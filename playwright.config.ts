import { execFileSync } from "node:child_process";

import { defineConfig, devices } from "@playwright/test";

const getPortlessUrl = (name: string) => {
  if (process.env.CI) {
    return undefined;
  }
  try {
    return execFileSync("portless", ["get", name], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return undefined;
  }
};

export const webUrl = getPortlessUrl("acme.web") ?? "http://localhost:3000";
export const apiUrl = getPortlessUrl("acme.api") ?? "http://localhost:4000";
export const landingUrl = getPortlessUrl("acme.landing") ?? "http://localhost:3001";

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  globalTeardown: "./tests/e2e/teardown/cleanup.ts",

  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      dependencies: ["setup"],
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/user.json",
      },
    },
    {
      dependencies: ["setup"],
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        storageState: "tests/e2e/.auth/user.json",
      },
    },
    {
      dependencies: ["setup"],
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        storageState: "tests/e2e/.auth/user.json",
      },
    },
  ],

  reporter: process.env.CI ? [["html", { open: "never" }]] : [["list"], ["html"]],
  retries: process.env.CI ? 2 : 0,
  testDir: "./tests/e2e",

  use: {
    baseURL: webUrl,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },

  webServer: process.env.CI
    ? [
        {
          command: "pnpm --filter web exec next start --port 3000",
          timeout: 120_000,
          url: webUrl,
        },
        {
          command: "pnpm --filter api run start",
          timeout: 120_000,
          url: `${apiUrl}/healthz`,
        },
        {
          command: "pnpm --filter landing exec next start --port 3001",
          timeout: 120_000,
          url: landingUrl,
        },
      ]
    : [],

  workers: process.env.CI ? 1 : undefined,
});
