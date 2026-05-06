const { defineConfig } = require('eslint/config');
const js = require('@eslint/js');
const globals = require('globals');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const expoConfig = require('eslint-config-expo/flat');
const jestPlugin = require('eslint-plugin-jest');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');

module.exports = defineConfig([
  expoConfig,
  js.configs.recommended,
  ...tseslint.configs['flat/recommended'],
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  {
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules: reactHooksPlugin.configs.recommended.rules,
  },
  {
    ignores: ['*.config.js', 'dist/*', 'src/assets/**'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
        PRODUCTION: true,
        TEST: true,
      },
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: 'module',
      },
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'none',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
        },
      ],
      'global-require': 'error',
      'import/order': [
        'error',
        {
          alphabetize: {
            caseInsensitive: true,
            order: 'asc',
          },
          groups: [
            'builtin',
            'external',
            'internal',
            ['sibling', 'parent'],
            'index',
            'object',
            'type',
          ],
          'newlines-between': 'always',
          pathGroups: [
            {
              group: 'builtin',
              pattern: 'react',
              position: 'before',
            },
            {
              group: 'builtin',
              pattern: 'react-native',
              position: 'before',
            },
            {
              group: 'internal',
              pattern: 'navigation/**',
              position: 'after',
            },
            {
              group: 'internal',
              pattern: '@/src/navigation/**',
              position: 'after',
            },
            {
              group: 'internal',
              pattern: 'types/**',
              position: 'after',
            },
            {
              group: 'internal',
              pattern: '@/src/types/**',
              position: 'after',
            },
            {
              group: 'internal',
              pattern: 'utils/**',
              position: 'after',
            },
            {
              group: 'internal',
              pattern: '@/src/utils/**',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
        },
      ],
      'key-spacing': ['error', { beforeColon: false }],
      'linebreak-style': 'error',
      'max-depth': ['error', 3],
      'max-lines': ['error', 500],
      'max-nested-callbacks': ['error', 3],
      complexity: ['error', 15],
      'no-confusing-arrow': 'error',
      'no-param-reassign': 'error',
      'prefer-destructuring': 'error',
      'prefer-object-spread': 'error',
      'react/destructuring-assignment': 'error',
      'react/display-name': 'error',
      'react/jsx-closing-tag-location': 'error',
      'react/no-access-state-in-setstate': 'error',
      'react/no-multi-comp': 'error',
      'react/no-unused-prop-types': 'error',
      'react/no-unused-state': 'error',
      'react/prefer-stateless-function': 'error',
    },
    settings: {
      'import/ignore': ['react'],
      react: {
        version: 'detect',
      },
    },
  },
  {
    ...jestPlugin.configs['flat/recommended'],
    files: ['**/*.spec.{js,jsx,ts,tsx}', '**/*.test.{js,jsx,ts,tsx}'],
  },
  {
    ...jestPlugin.configs['flat/style'],
    files: ['**/*.spec.{js,jsx,ts,tsx}', '**/*.test.{js,jsx,ts,tsx}'],
  },
  {
    files: ['**/*.spec.{js,jsx,ts,tsx}', '**/*.test.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      'jest/consistent-test-it': 'error',
      'jest/expect-expect': 'error',
      'jest/import-default': 'off',
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/no-test-prefixes': 'error',
      'jest/prefer-to-have-length': 'error',
      'jest/valid-expect': 'error',
    },
  },
]);
