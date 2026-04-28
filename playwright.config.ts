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

  // CI spawns three webServers in parallel. Wrapping each in `pnpm --filter`
  // serializes them on pnpm's workspace state lock — the first wins, the
  // rest hang silently for the full timeout. Run the binaries directly so
  // each spawn is independent. Pnpm hoists shared bins to the repo-root
  // `node_modules/.bin/`, so we reference them from there and pass the app
  // directory as an arg to `next start`.
  webServer: process.env.CI
    ? [
        {
          command: "node_modules/.bin/next start apps/web --port 3000",
          stderr: "pipe",
          stdout: "pipe",
          timeout: 120_000,
          url: webUrl,
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
