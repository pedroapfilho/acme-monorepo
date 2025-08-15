import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  unbundle: true,
  platform: "node",
  target: "node18",
  sourcemap: true,
  clean: true,
  format: ["cjs"],
});
