import typescriptEslint from "typescript-eslint";
import baseConfig from "./eslint.config.mjs";

// build/production configuration extends default/development configuration
export default typescriptEslint.config(
  ...baseConfig,
  {
    rules: {
      "@eslint-community/eslint-comments/no-unused-disable": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error"
    }
  }
);
