import nextVitals from 'eslint-config-next/core-web-vitals';
import prettier from 'eslint-config-prettier/flat';
import boundaries from 'eslint-plugin-boundaries';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import unusedImports from 'eslint-plugin-unused-imports';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  // 1) Base presets
  ...nextVitals,
  tseslint.configs.recommendedTypeChecked,
  eslintPluginUnicorn.configs.recommended,

  // 2) File-scoped layers (add new file-specific blocks here)
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts'],
    languageOptions: {
      parserOptions: { projectService: true },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': 'error',
    },
  },

  // 3) Global rules/plugins (add new global blocks here)
  {
    plugins: { boundaries, 'unused-imports': unusedImports },
    settings: {
      'boundaries/elements': [
        { type: 'internal.base', pattern: 'src/internal/base/*' },
        { type: 'internal.core.features', pattern: 'src/internal/core/features/*' },
        { type: 'internal.core.layout.workspace', pattern: 'src/internal/core/layout/workspace/*' },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: { type: 'internal.base' },
              allow: {
                to: {
                  type: [
                    'internal.base',
                    'internal.core.features',
                    'internal.core.layout.workspace',
                  ],
                },
              },
            },
            {
              from: { type: 'internal.core.features' },
              allow: { to: { type: ['internal.base', 'internal.core.layout.workspace'] } },
            },
            {
              from: { type: 'internal.core.layout.workspace' },
              allow: { to: { type: 'internal.core.features' } },
            },
          ],
        },
      ],
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
      'react/no-unknown-property': 'error',
      'react/jsx-no-target-blank': 'error',
      'react/prop-types': 'error',
      'react/hook-use-state': 'error',
      'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
      'react/jsx-no-useless-fragment': 'error',
      'react/jsx-no-leaked-render': 'error',
      'unicorn/filename-case': ['error', { cases: { camelCase: true, pascalCase: true } }],
      'unicorn/prevent-abbreviations': [
        'error',
        { allowList: { fn: true, props: true, opts: true } },
      ],
      'unicorn/no-null': 'off',
      'object-shorthand': 'error',
    },
  },

  // 4) Formatting overrides (keep near end)
  prettier,

  // 5) Ignores (keep last)
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'node_modules/**',
    'next-env.d.ts',
    '*.d.ts',
    'coverage/**',
    '.cache/**',
    '.turbo/**',
    '.env*',
    '*.lock',
  ]),
]);
