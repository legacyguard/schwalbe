module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.(test|spec).[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/tests/e2e/'],
  passWithNoTests: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/stubs/**/*',
    '!src/**/*.stories.{ts,tsx}',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'html', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.json', useESM: true }
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@schwalbe/shared$': '<rootDir>/../../packages/shared/src/index-minimal.ts',
    '^@schwalbe/shared/(.*)$': '<rootDir>/../../packages/shared/src/$1',
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
};
