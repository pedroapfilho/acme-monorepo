/// <reference types="node" />

import { defineConfig, devices } from "@playwright/test";
import { apps } from "@repo/portless-env/apps";

import { apiUrl, landingUrl, webUrl } from "./tests/e2e/urls";

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
