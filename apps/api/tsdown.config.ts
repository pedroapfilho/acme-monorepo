import path from "node:path";

import alias from "@rollup/plugin-alias";
import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  deps: {
    // Workspace packages export .ts source — Node can't import those at runtime,
    // so tsdown must bundle them into the output instead of leaving them as external imports.
    alwaysBundle: ["@repo/auth", "@repo/db"],
  },
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "node",
  plugins: [
    alias({
      entries: [{ find: "@", replacement: path.resolve(process.cwd(), "src") }],
    }),
  ],
  sourcemap: true,
  target: "node22",
  tsconfig: "tsconfig.json",
});
