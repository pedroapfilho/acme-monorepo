import { fixupConfigRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import next from "@vercel/style-guide/eslint/next";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginOnlyWarn from "eslint-plugin-only-warn";
import globals from "globals";
import path from "path";
import ts from "typescript-eslint";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default ts.config(
  {
    ignores: [".*.js", "node_modules/"],
  },
  {
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
  },
  {
    plugins: {
      ["only-warn"]: eslintPluginOnlyWarn,
    },
  },
  js.configs.recommended,
  ...fixupConfigRules(compat.config(next)),
  ...compat.extends("turbo"),
  ...ts.config({
    files: ["**/*.js?(x)", "**/*.ts?(x)"],
    extends: [...ts.configs.recommended],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.?(m)js"],
        },
      },
    },
  }),
  eslintConfigPrettier,
);
