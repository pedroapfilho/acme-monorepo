/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@repo/eslint-config/server"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
};
