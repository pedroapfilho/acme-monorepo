import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const reactConfig = defineConfig({
  plugins: [react()],
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
