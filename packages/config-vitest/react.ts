import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import zodCompiler from "zod-compiler/vite";

const reactConfig = defineConfig({
  plugins: [zodCompiler(), react()],
  test: {
    css: false,
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    passWithNoTests: true,
    setupFiles: ["@repo/config-vitest/setup-react"],
  },
});

export default reactConfig;
