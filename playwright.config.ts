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

// CI binds 0.0.0.0 but Node 18+ resolves localhost to ::1 and undici won't fall back to IPv4.
export const webUrl = getPortlessUrl("acme.web") ?? "http://127.0.0.1:3000";
export const apiUrl = getPortlessUrl("acme.api") ?? "http://127.0.0.1:4000";
export const landingUrl = getPortlessUrl("acme.landing") ?? "http://127.0.0.1:3001";

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  globalTeardown: "./tests/e2e/teardown/cleanup.ts",

  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/v },
    {
      dependencies: ["setup"],
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/user.json",
      },
    },
    ...(process.env.CI
      ? []
      : [
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
        ]),
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

  // Spawn binaries directly: `pnpm --filter` would serialize the three webServers
  // on pnpm's workspace lock and the losers hang silently.
  webServer: process.env.CI
    ? [
        {
          command: "node_modules/.bin/next start apps/web --port 3000",
          stderr: "pipe",
          stdout: "pipe",
          timeout: 120_000,
          // Web has no `/` route; probe /login so readiness detection lands a 200.
          url: `${webUrl}/login`,
        },
        {
          command: "node apps/api/dist/index.mjs",
          stderr: "pipe",
          stdout: "pipe",
          timeout: 120_000,
          url: `${apiUrl}/healthz`,
        },
        {
          command: "node_modules/.bin/next start apps/landing --port 3001",
          stderr: "pipe",
          stdout: "pipe",
          timeout: 120_000,
          url: landingUrl,
        },
      ]
    : [],

  workers: process.env.CI ? 1 : undefined,
});
