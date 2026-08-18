import { defineConfig } from "vitest/config";
import zodCompiler from "zod-compiler/vite";

const nodeConfig = defineConfig({
  plugins: [zodCompiler()],
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    passWithNoTests: true,
  },
});

export default nodeConfig;
