import nodeConfig from "@repo/config-vitest/node";
import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(
  nodeConfig,
  defineConfig({
    resolve: {
      alias: {
        "@": new URL("src", import.meta.url).pathname,
      },
    },
    test: {
      env: {
        BETTER_AUTH_SECRET: "test-secret-minimum-32-characters-long",
        DATABASE_URL: "postgresql://acme:acme123@localhost:5432/acme",
      },
    },
  }),
);
