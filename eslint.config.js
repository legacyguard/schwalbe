import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import pluginImport from 'eslint-plugin-import';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      '@typescript-eslint': typescript,
      import: pluginImport
    },
    rules: {
      ...typescript.configs.recommended.rules,
      '@typescript-eslint/no-unused-expressions': 'off',
      // Boundary enforcement rules
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../../apps/*', '../../apps/*', '../apps/*'],
              message: 'Packages cannot import from apps. Use proper package dependencies instead.'
            }
          ]
        }
      ],
      // Code quality rules
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      // Enforce import hygiene across packages/apps (except Next.js app which has its own ESLint)
      'import/order': ['warn', { groups: [['builtin','external','internal','parent','sibling','index']], 'newlines-between': 'always' }],
      'import/no-extraneous-dependencies': ['error', {
        packageDir: [
          '.',
          './packages/logic',
          './packages/shared',
          './packages/ui',
          './apps/web',
          './apps/mobile'
        ]
      }]
    }
  },
  // Loosen rules for declaration files in apps/web to avoid noisy warnings
  {
    files: ['apps/web/src/**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off'
    }
  },
  // Test files: provide Jest globals
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/__tests__/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly'
      }
    }
  },
  prettier
];
