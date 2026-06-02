import path from "node:path";

import alias from "@rollup/plugin-alias";
import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  deps: {
    // Workspace packages export .ts source — Node can't import those at runtime,
    // so tsdown must bundle them into the output instead of leaving them as external imports.
    alwaysBundle: ["@repo/auth", "@repo/auth/server", "@repo/db", "@repo/transactional"],
    // pino-pretty spawns its own worker_threads worker at `./lib/worker.js`
    // relative to the bundle — when pino is bundled, the worker file is
    // missing and the runtime errors with
    // `Cannot find module 'apps/api/dist/lib/worker.js'`. Keep pino external
    // so its worker files stay accessible via node_modules.
    neverBundle: ["pino", "pino-pretty"],
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
