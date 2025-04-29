import typescriptEslint from "typescript-eslint";
import stylisticJsx from "@stylistic/eslint-plugin-jsx";
import baseConfig from "./eslint.config.mjs";

// style configuration extends default/development configuration
// TODO: document why this is separate from the base config
export default typescriptEslint.config(
  ...baseConfig,
  {
    plugins: {
      "@stylistic/jsx": stylisticJsx
    },
    rules: {
      "@stylistic/js/array-bracket-spacing": ["error", "never"],
      "@stylistic/js/object-curly-spacing": ["error", "always"],
      "@stylistic/jsx/jsx-curly-spacing": ["error", { "when": "never", "children": { "when": "always" } }],
    }
  }
);
