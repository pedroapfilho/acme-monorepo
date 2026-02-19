import { defineConfig } from "oxlint";
import awesomeness from "oxlint-config-awesomeness";

const config = defineConfig({
  extends: [awesomeness],
  ignorePatterns: [
    ".next/**",
    "build/**",
    "coverage/**",
    "dist/**",
    "next-env.d.ts",
    "node_modules/**",
    "storybook-static/**",
    "verify-auth.js",
  ],
  overrides: [
    {
      env: { browser: false, node: true },
      files: ["apps/api/**/*.ts"],
    },
    {
      files: ["**/*.test.ts", "**/*.spec.ts", "**/__tests__/**"],
      rules: { "@typescript-eslint/no-explicit-any": "off" },
    },
    {
      files: ["apps/workshop/**/*.stories.tsx"],
      rules: { "no-console": "off" },
    },
    {
      files: ["**/seed.ts"],
      rules: { "no-console": "off" },
    },
  ],
});

export default config;
