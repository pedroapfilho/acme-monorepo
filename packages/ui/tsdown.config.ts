import { defineConfig } from "tsdown";

export default defineConfig({
  clean: false,
  deps: {
    neverBundle: ["react", "react-dom"],
  },
  dts: true,
  entry: ["src/index.ts"],
  format: ["esm"],
  sourcemap: false,
  target: "es2020",
  tsconfig: "tsconfig.json",
});
