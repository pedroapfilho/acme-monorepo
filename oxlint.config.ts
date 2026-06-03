import { defineConfig } from "oxlint";
import awesomeness from "oxlint-config-awesomeness";

export default defineConfig({
  extends: [awesomeness],
  overrides: [
    // PascalCase factories from next/font/google (Inter) and @scalar/hono-api-reference (Scalar).
    {
      files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
      rules: {
        "new-cap": [
          "error",
          {
            capIsNewExceptions: ["Inter", "Scalar"],
          },
        ],
      },
    },
    // Pre-logger error sinks for auth/proxy failures (DB down, misconfig).
    {
      files: [
        "apps/web/src/middleware.ts",
        "apps/web/src/lib/auth-helpers.ts",
        "packages/auth/src/server.ts",
      ],
      rules: {
        "no-console": "off",
      },
    },
    // Playwright's selector engine rejects /v-flagged regex literals at runtime.
    {
      files: ["tests/**", "playwright.config.ts"],
      rules: {
        "require-unicode-regexp": "off",
      },
    },
  ],
});
