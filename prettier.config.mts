import { type Config } from 'prettier';

const config: Config = {
  singleQuote: true,
  trailingComma: 'all',
  arrowParens: 'always',
  tabWidth: 2,
  useTabs: false,
  printWidth: 100,
  bracketSpacing: true,
  jsxSingleQuote: true,
  endOfLine: 'lf',
  quoteProps: 'as-needed',
  semi: true,

  // Plugins
  plugins: ['@tailwindcss/postcss', '@trivago/prettier-plugin-sort-imports'],
  importOrder: [
    'server-only',
    '<BUILTIN_MODULES>',
    '^react$',
    '^next',
    '^@mui',
    '<THIRD_PARTY_MODULES>',
    '^[./]',
  ],
  importOrderSeparation: false,
  importOrderSortSpecifiers: true,
};

export default config;
