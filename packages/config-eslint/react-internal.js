import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginOnlyWarn from "eslint-plugin-only-warn";
import eslintPluginReact from "eslint-plugin-react";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
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
    ignores: [".*.js", "node_modules/", "dist/"],
  },
  {
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    plugins: {
      ["only-warn"]: eslintPluginOnlyWarn,
      react: eslintPluginReact,
      "react-hooks": eslintPluginReactHooks,
    },
  },
  js.configs.recommended,
  ...compat.extends("turbo"),
  ...ts.config({
    files: ["**/*.js?(x)", "**/*.ts?(x)"],
    extends: [...ts.configs.recommended],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["*.*s", "turbo/generators/*.*s"],
        },
      },
    },
  }),
  eslintConfigPrettier,
);
