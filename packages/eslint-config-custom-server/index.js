/**
 * @type {import('eslint').Linter.Config}
 */
export default {
  extends: ["eslint:recommended", "turbo"],
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  overrides: [
    {
      files: ["**/__tests__/**/*"],
      env: {
        jest: true,
      },
    },
  ],
  rules: {
    "prefer-const": ["error"],
  },
};
