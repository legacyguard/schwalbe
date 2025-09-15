/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: '<rootDir>/tsconfig.json',
        diagnostics: {
          warnOnly: true,
        },
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    // Stub shared package to avoid initializing Supabase client in tests
    '^@schwalbe/shared$': '<rootDir>/src/__tests__/__mocks__/shared.ts',
    '^@shared/(.*)$': '<rootDir>/../shared/src/$1',
  },
  testRegex: '(/__tests__/.*\\.(test|spec))\\.(ts|tsx)$',
  verbose: false,
};