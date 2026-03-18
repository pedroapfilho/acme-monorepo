import { defineConfig } from "tsdown";

export default defineConfig({
  clean: false,
  dts: true,
  entry: ["src/index.ts"],
  external: ["react", "react-dom"],
  format: ["esm"],
  sourcemap: false,
  target: "es2020",
  tsconfig: "tsconfig.json",
});
