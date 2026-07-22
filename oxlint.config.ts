import { defineConfig } from "oxlint";
import awesomeness from "oxlint-config-awesomeness";

export default defineConfig({
  extends: [awesomeness],
  options: {
    typeAware: true,
    typeCheck: true,
  },
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
    // Playwright's selector engine rejects /v-flagged regex literals at runtime.
    {
      files: ["tests/**", "playwright.config.ts"],
      rules: {
        "require-unicode-regexp": "off",
      },
    },
    // Config files resolve portless URLs at load time; module scope can't await.
    {
      files: ["playwright.config.ts", "**/next.config.ts"],
      rules: {
        "node/no-sync": "off",
      },
    },
  ],
});
