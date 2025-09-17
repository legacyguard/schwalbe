/** @type {import('jest').Config} */
module.exports = {
  // Use ts-jest preset for TypeScript support
  preset: 'ts-jest',
  
  // Define projects for different packages with their specific environments
  projects: [
    {
      displayName: 'logic',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/packages/logic/**/*.test.{ts,tsx}'],
      moduleNameMapper: {
        '^@hollywood/(.*)$': '<rootDir>/packages/$1/src',
        '^@legacyguard/(.*)$': '<rootDir>/packages/$1/src',
      },
    },
    {
      displayName: 'shared',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/packages/shared/**/*.test.{ts,tsx}'],
      moduleNameMapper: {
        '^@hollywood/(.*)$': '<rootDir>/packages/$1/src',
        '^@legacyguard/(.*)$': '<rootDir>/packages/$1/src',
      },
    },
    {
      displayName: 'ui',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/packages/ui/**/*.test.{ts,tsx}'],
      moduleNameMapper: {
        '^@hollywood/(.*)$': '<rootDir>/packages/$1/src',
        '^@legacyguard/(.*)$': '<rootDir>/packages/$1/src',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      },
      setupFilesAfterEnv: ['<rootDir>/packages/ui/jest.setup.js'],
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
          tsconfig: {
            jsx: 'react',
          },
        }],
      },
    },
    {
      displayName: 'web',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/web/**/*.test.{ts,tsx,js,jsx}'],
      moduleNameMapper: {
        '^@hollywood/(.*)$': '<rootDir>/packages/$1/src',
        '^@legacyguard/(.*)$': '<rootDir>/packages/$1/src',
        '^@/(.*)$': '<rootDir>/web/src/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/web/__mocks__/fileMock.js',
      },
      setupFilesAfterEnv: ['<rootDir>/web/jest.setup.js'],
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
      },
      transformIgnorePatterns: [
        'node_modules/(?!(react-markdown|remark|unified|bail|is-plain-obj|trough|vfile|vfile-message|mdast-util-from-markdown|mdast-util-to-string|micromark|decode-named-character-reference|character-entities|property-information|hast-util-whitespace|hast-util-to-jsx-runtime|html-url-attributes|comma-separated-tokens|space-separated-tokens|style-to-object|unist-util-visit|unist-util-visit-parents|unist-util-is|@radix-ui|@floating-ui)/)',
      ],
    },
    {
      displayName: 'mobile',
      preset: 'react-native',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/mobile/**/*.test.{ts,tsx}'],
      moduleNameMapper: {
        '^@hollywood/(.*)$': '<rootDir>/packages/$1/src',
        '^@legacyguard/(.*)$': '<rootDir>/packages/$1/src',
      },
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
          tsconfig: {
            jsx: 'react',
          },
        }],
      },
      transformIgnorePatterns: [
        'node_modules/(?!(react-native|@react-native|@react-navigation|@shopify/react-native-skia|@tamagui|react-native-reanimated|react-native-screens|react-native-safe-area-context|react-native-gesture-handler|react-native-vision-camera)/)',
      ],
    },
  ],
  
  // Global settings
  collectCoverageFrom: [
    'packages/*/src/**/*.{ts,tsx}',
    'web/src/**/*.{ts,tsx}',
    'mobile/src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/*.stories.{ts,tsx}',
    '!**/dist/**',
    '!**/build/**',
    '!**/.next/**',
  ],
  
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Collect coverage
  collectCoverage: false,
  
  // Coverage directory
  coverageDirectory: '<rootDir>/coverage',
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
};
