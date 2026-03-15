import { config } from "./base.js";

/**
 * ESLint configuration for NestJS applications.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const nestJsConfig = [
  ...config,
  {
    ignores: ["dist/**"],
  },
];
