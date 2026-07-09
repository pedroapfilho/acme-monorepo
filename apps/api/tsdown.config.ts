import path from "node:path";

import alias from "@rollup/plugin-alias";
import { defineConfig } from "tsdown";

const srcDir = path.resolve(process.cwd(), "src");

export default defineConfig({
  clean: true,
  deps: {
    // Workspace packages export .ts source — Node can't import those at runtime.
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
    alias({
      entries: [{ find: "@", replacement: srcDir }],
    }),
  ],
  sourcemap: true,
  target: "node22",
  tsconfig: "tsconfig.json",
});
