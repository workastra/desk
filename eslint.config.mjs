import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import unusedImports from 'eslint-plugin-unused-imports';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintPluginUnicorn.configs.recommended,
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    rules: {
      // Override NextJS default rules
      'react/no-unknown-property': 'error',
      'react/prop-types': 'error',
      'react/jsx-no-target-blank': 'error',

      // Custom rules
      'react/hook-use-state': 'error',
      'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
      'react/jsx-no-useless-fragment': 'error',
      'react/jsx-no-leaked-render': 'error',

      'unicorn/filename-case': [
        'error',
        {
          cases: {
            camelCase: true,
            pascalCase: true
          },
        }
      ]
    },
  },
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
