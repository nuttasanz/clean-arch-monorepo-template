import { nextJsConfig } from "@repo/eslint-config/next-js";
import globals from "globals";

export default [
  ...nextJsConfig,
  {
    files: ["**/*.cjs"],
    languageOptions: {
      globals: globals.node,
    },
  },
];
