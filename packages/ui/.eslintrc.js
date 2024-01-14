/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["@repo/eslint-config/react-internal"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
};
