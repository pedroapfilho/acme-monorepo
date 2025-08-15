import alias from "@rollup/plugin-alias";
import path from "path";
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  platform: "node",
  target: "node22",
  sourcemap: true,
  clean: true,
  format: ["esm"],
  tsconfig: "tsconfig.json",
  plugins: [
    alias({
      entries: [{ find: "@", replacement: path.resolve(process.cwd(), "src") }],
    }),
  ],
  external: ["@repo/db"],
});
