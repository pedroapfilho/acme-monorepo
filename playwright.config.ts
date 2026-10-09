/// <reference types="node" />

import { defineConfig, devices } from "@playwright/test";
import type { PlaywrightTestProject } from "@playwright/test";
import { apps } from "@repo/portless-env/apps";

import type { SessionOptions } from "./tests/e2e/fixtures/session";
import { TEST_USER_STATE } from "./tests/e2e/fixtures/test-user";
import { apiUrl, landingUrl, webUrl } from "./tests/e2e/urls";

const emailDelivery = Boolean(process.env.RESEND_API_KEY);

const browserProject = (
  name: string,
  device: keyof typeof devices,
): PlaywrightTestProject<SessionOptions> => ({
  dependencies: ["setup"],
  grepInvert: emailDelivery ? /@no-email/ : /@email/,
  name,
  use: { ...devices[device], emailDelivery, storageState: TEST_USER_STATE },
});

export default defineConfig<SessionOptions>({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  globalTeardown: "./tests/e2e/teardown/cleanup.ts",

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

  webServer: process.env.CI
    ? [
        {
          command: "node tests/e2e/support/resend-stub.ts",
          stderr: "pipe",
          stdout: "pipe",
          url: `${process.env.RESEND_BASE_URL}/emails`,
        },
        {
          command: `node_modules/.bin/next start apps/web --port ${apps.web.port}`,
          env: { PGAPPNAME: "acme:ci:web" },
          stderr: "pipe",
          stdout: "pipe",
          timeout: 120_000,
          url: `${webUrl}/login`,
        },
        {
          command: "node apps/api/dist/index.mjs",
          env: { PGAPPNAME: "acme:ci:api" },
          stderr: "pipe",
          stdout: "pipe",
          timeout: 120_000,
          url: `${apiUrl}/healthz`,
        },
        {
          command: `node_modules/.bin/next start apps/landing --port ${apps.landing.port}`,
          env: { PGAPPNAME: "acme:ci:landing" },
          stderr: "pipe",
          stdout: "pipe",
          timeout: 120_000,
          url: landingUrl,
        },
      ]
    : [],

  workers: process.env.CI ? 1 : undefined,
});
