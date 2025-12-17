/**
 * @type {ESLint.ConfigData}
 */
module.exports = {
  ignorePatterns: [".server", "src/__fixtures__", "coverage"],
  env: {
    es2022: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:jsdoc/recommended",
    "plugin:promise/recommended",
    "prettier",
  ],
  plugins: ["import", "jsdoc", "promise"],
  rules: {
    // Playwright specs occasionally log diagnostic info
    "no-console": "error",

    // Keep import checks lightweight for this JS-only repo
    "import/no-unresolved": "off",

    // Avoid duplicate warnings with eslint:recommended
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
  },
  overrides: [
    {
      files: ["**/*.{cjs,js,mjs}"],
      rules: {
        // Check import or require statements are A-Z ordered
        "import/order": [
          "error",
          {
            alphabetize: { order: "asc" },
            named: true,
            "newlines-between": "always",
          },
        ],

        // This repo uses relative imports; no alias enforcement here
        "no-restricted-imports": "off",
      },
    },
    {
      files: ["**/*.cjs"],
      parserOptions: { sourceType: "script" },
      rules: {
        // CommonJS config files
      },
    },
    {
      files: ["**/*.spec.{js,mjs}", "**/*.spec.cjs"],
      rules: {
        "no-console": "off",
      },
    },
  ],
  root: true,
};

/**
 * @import { ESLint } from 'eslint'
 */
