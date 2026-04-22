import { defineConfig } from "oxlint";
import awesomeness from "oxlint-config-awesomeness";

export default defineConfig({
  extends: [awesomeness],
  overrides: [
    {
      files: ["apps/**/src/app/**/layout.tsx"],
      rules: {
        // next/font/google fonts are factory calls (`Inter({...})`), not constructors
        "new-cap": "off",
      },
    },
    {
      files: ["apps/**/src/components/analytics.tsx"],
      rules: {
        // next/dynamic requires .then() to remap a named export onto `default`
        "promise/prefer-await-to-then": "off",
      },
    },
    {
      // Design system variants (size, intent, etc.) order semantically, not alphabetically
      files: ["packages/ui/src/**"],
      rules: {
        "perfectionist/sort-jsx-props": "off",
        "perfectionist/sort-objects": "off",
      },
    },
  ],
});
