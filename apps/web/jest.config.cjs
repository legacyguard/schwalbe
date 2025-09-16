module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.(test|spec).[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/tests/e2e/'],
  passWithNoTests: true,
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
