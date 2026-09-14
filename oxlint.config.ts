import { defineConfig } from "oxlint";
import awesomeness from "oxlint-config-awesomeness";

export default defineConfig({
  extends: [awesomeness],
  jsPlugins: ["@shadcn/lint"],
  overrides: [
    {
      files: ["packages/ui/src/lib/utils.test.ts"],
      rules: {
        "shadcn/no-unknown-classes": ["error", { allow: ["foo", "bar", "baz"] }],
      },
    },
    {
      files: ["packages/ui/src/components/**"],
      rules: {
        "shadcn/no-restyle": "off",
        "shadcn/require-static-classes": "off",
      },
    },
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
