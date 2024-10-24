import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
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
    ignores: [".*.js", "node_modules/", "dist/"],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    plugins: {
      ["only-warn"]: eslintPluginOnlyWarn,
    },
  },
  js.configs.recommended,
  ...compat.extends("turbo"),
  ...ts.config({
    files: ["**/*.js", "**/*.ts"],
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
