import path from "node:path";

import { applyPortlessUrls } from "@repo/portless-env";
import alias from "@rollup/plugin-alias";
import { defineConfig } from "tsdown";
import zodCompiler from "zod-compiler/rolldown";

applyPortlessUrls({
  CORS_ORIGINS: ["acme.web", "acme.landing"],
  WEB_APP_URL: ["acme.web"],
});

const srcDir = path.resolve(process.cwd(), "src");

export default defineConfig({
  clean: true,
  deps: {
    alwaysBundle: [
      "@repo/auth",
      "@repo/auth/server",
      "@repo/db",
      "@repo/observability",
      "@repo/observability/auth",
      "@repo/observability/hono",
      "@repo/transactional",
    ],
  },
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "node",
  plugins: [
    zodCompiler(),
    alias({
      entries: [{ find: "@", replacement: srcDir }],
    }),
  ],
  sourcemap: true,
  target: "node22",
  tsconfig: "tsconfig.json",
});
