import { defineConfig, Options } from "tsup";

export default defineConfig((options: Options) => ({
  banner: {
    js: '"use client"',
  },
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  external: ["react"],
  esbuildOptions(options) {
    options.external = ["@radix-ui/*"];
  },
  ...options,
}));
