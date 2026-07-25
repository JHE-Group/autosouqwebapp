import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([".next/**", "out/**", "build/**"]),
  {
    // The theme's copy is full of unescaped apostrophes ("Don't", "car's").
    // Purely stylistic — keep it visible as a warning rather than failing lint.
    rules: {
      "react/no-unescaped-entities": "warn",
    },
  },
]);

export default eslintConfig;
