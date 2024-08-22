import sharedConfig from "@repo/tailwind-config/tailwind.config.ts";
import type { Config } from "tailwindcss";

const config: Pick<Config, "prefix" | "presets" | "corePlugins"> = {
  prefix: "ui-",
  presets: [sharedConfig],
  corePlugins: {
    preflight: false,
  },
};

export default config;
