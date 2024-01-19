import { defineConfig, Options } from "tsup";

export default defineConfig((options: Options) => ({
  entry: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node18",
  sourcemap: true,
  clean: true,
  ...options,
}));
