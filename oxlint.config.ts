import { defineConfig } from "oxlint";
import awesomeness from "oxlint-config-awesomeness";

export default defineConfig({
  extends: [awesomeness],
  // Generated runtime is byte-verified and tested in the control plane.
  ignorePatterns: [".github/ci/*.mjs"],
  jsPlugins: ["@shadcn/lint"],
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
      rules: {
        "new-cap": [
          "error",
          {
            capIsNewExceptions: ["Inter", "Scalar"],
          },
        ],
      },
    },
  ],
  rules: {
    "shadcn/no-arbitrary-values": "error",
    "shadcn/no-inline-styles": "error",
    "shadcn/no-raw-colors": "error",
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
    "shadcn/no-unknown-classes": "error",
    "shadcn/require-static-classes": "error",
  },
  settings: {
    shadcn: { ui: "@repo/ui/components" },
  },
});
