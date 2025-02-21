import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: { plugins: ["eslint:recommended"] },
});

export default [
  ...compat.extends("next/core-web-vitals"),
  {
    // Add this to avoid the function serialization issue
    languageOptions: {
      parser: null, // Let ESLint determine the parser
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
  },
];
