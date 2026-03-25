import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const reactConfig = defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["@repo/config-vitest/setup-react"],
    css: false,
    include: ["src/**/*.test.{ts,tsx}"],
    passWithNoTests: true,
  },
});

export default reactConfig;
