import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node18",
  sourcemap: true,
  clean: true,
  format: ["cjs"],
});