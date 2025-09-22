/**
 * Base ESLint configuration
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  {
    ignores: [
      "dist/**",
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "build/**",
      "next-env.d.ts",
      "**/.eslintrc.js",
      "storybook-static/**",
    ],
  },
];
