import { defineConfig } from "oxlint";
import awesomeness from "oxlint-config-awesomeness";
import shadcn from "oxlint-config-awesomeness/shadcn";

export default defineConfig({
  extends: [awesomeness, shadcn],
  // Generated runtime is byte-verified and tested in the control plane.
  ignorePatterns: [".github/ci/*.mjs"],
  rules: {
    "shadcn/no-restyle": [
      "error",
      {
        allow: ["layout"],
        contracts: [
          { allow: ["layout", "typography"], deny: ["font-*"], pattern: "^CardTitle$" },
          { allow: ["layout", "spacing"], pattern: "^CardContent$" },
        ],
      },
    ],
  },
  settings: {
    shadcn: { ui: "@repo/ui/components" },
  },
});
