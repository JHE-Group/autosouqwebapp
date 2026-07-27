import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([".next/**", "out/**", "build/**"]),
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // The theme's copy is full of unescaped apostrophes ("Don't", "car's").
      // Purely stylistic — keep it visible as a warning rather than failing lint.
      "react/no-unescaped-entities": "warn",

      /**
       * Undefined identifiers are an error, not a warning.
       *
       * `eslint-config-next` does not enable `no-undef`, and this project has
       * no type checker on the web app — so nothing at all was checking that
       * the names in a JSX file exist. It cost us a real one:
       * ListingCard.jsx called `pick(COPY.kmUnstated, locale)`, where neither
       * `pick` nor `COPY` was defined or imported anywhere in the repo. It
       * linted clean, built clean, and would have thrown at render on the
       * first listing with an unstated mileage, taking /used-cars and every
       * facet lander with it.
       *
       * This rule needs the globals above to know what `window`, `document`
       * and `process` are; without them it reports the whole DOM as undefined.
       */
      "no-undef": "error",
    },
  },
]);

export default eslintConfig;
