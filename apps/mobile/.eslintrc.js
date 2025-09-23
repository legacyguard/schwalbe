module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint', './eslint-rules'],
  rules: {
    // Align with root config
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    // Mobile-specific relaxed rules
    '@typescript-eslint/no-unused-expressions': 'off',
    // Custom rule to detect hardcoded user-facing strings
    './eslint-rules/no-hardcoded-strings': ['warn', {
      allowed: [
        // Allow common non-user-facing strings
        /^[a-zA-Z_$][a-zA-Z0-9_$]*$/, // Variable names, function names
        /^[0-9]+.*$/, // Numbers and measurements
        /^#.*$/, // Hex colors
        /^\$.*$/, // CSS variables
        /^https?:\/\/.*$/, // URLs
        /^@.*$/, // Imports/decorators
        /^'.*'\s*\+\s*'.*'$/, // String concatenation
        // Allow specific common strings
        'white', 'black', 'red', 'blue', 'green', 'yellow', 'gray',
        'center', 'left', 'right', 'top', 'bottom',
        'flex', 'block', 'none', 'auto',
        'solid', 'dashed', 'dotted',
        'bold', 'normal', 'italic',
        'absolute', 'relative', 'fixed',
        'pointer', 'default', 'text', 'email', 'password',
        'submit', 'button', 'input', 'form', 'div', 'span',
        'true', 'false', 'null', 'undefined',
        'react-native', 'expo-router', 'zustand',
        'LegacyGuard', 'Legacy Guard'
      ],
      ignore: [
        // Ignore test files
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        // Ignore config files
        '**/jest.config.*',
        '**/babel.config.js',
        '**/metro.config.js',
        '**/.eslintrc.js',
        // Ignore i18n files
        '**/i18n.ts'
      ]
    }]
  },
  env: {
    browser: true,
    es6: true,
    node: true
  },
  ignorePatterns: ['node_modules/', 'dist/', '.expo/']
};