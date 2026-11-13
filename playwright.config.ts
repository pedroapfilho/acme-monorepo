/// <reference types="node" />

import { existsSync } from "node:fs";

import { defineConfig, devices } from "@playwright/test";
import type { PlaywrightTestProject } from "@playwright/test";
import { apps } from "@repo/portless-env/apps";

import { TEST_USER_STATE } from "./tests/e2e/fixtures/test-user";
import { apiUrl, landingUrl, webUrl } from "./tests/e2e/urls";

const WEB_ENV_FILE = "apps/web/.env";

// The runner and the servers it starts read the web app's environment, so they agree on the database. Variables already set win.
if (existsSync(WEB_ENV_FILE)) {
  process.loadEnvFile(WEB_ENV_FILE);
}

const environment = process.env.CI ? "ci" : "local";

const server = (service: "api" | "landing" | "web", command: string, url: string) => ({
  command,
  env: {
    AUTH_RATE_LIMIT: "off",
    MAIL_TRANSPORT: "outbox",
    PGAPPNAME: `acme:${environment}:${service}`,
    WEB_APP_URL: webUrl,
  },
  reuseExistingServer: !process.env.CI,
  stderr: "pipe" as const,
  stdout: "pipe" as const,
  timeout: 120_000,
  url,
});

const browserProject = (name: string, device: keyof typeof devices): PlaywrightTestProject => ({
  dependencies: ["setup"],
  name,
  use: { ...devices[device], storageState: TEST_USER_STATE },
});

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  globalSetup: "./tests/e2e/setup/local-database.ts",

  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    browserProject("chromium", "Desktop Chrome"),
    ...(process.env.CI
      ? []
      : [browserProject("firefox", "Desktop Firefox"), browserProject("webkit", "Desktop Safari")]),
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

  webServer: [
    server(
      "web",
      `node_modules/.bin/next start apps/web --port ${apps.web.port}`,
      `${webUrl}/login`,
    ),
    server("api", "node apps/api/dist/index.mjs", `${apiUrl}/healthz`),
    server(
      "landing",
      `node_modules/.bin/next start apps/landing --port ${apps.landing.port}`,
      landingUrl,
    ),
  ],

  workers: process.env.CI ? 1 : undefined,
});
