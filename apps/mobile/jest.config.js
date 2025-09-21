const expoPreset = require('jest-expo/jest-preset')
const rtlPreset = require('@testing-library/react-native/jest-preset')

const baseProject = {
  displayName: 'base',
  rootDir: __dirname,
  ...expoPreset,
  ...rtlPreset,
  testMatch: ['**/__tests__/**/*.(test|spec).[jt]s?(x)'],
  setupFilesAfterEnv: [
    ...(expoPreset.setupFilesAfterEnv || []),
    '<rootDir>/jest.setup.js'
  ],
  moduleNameMapper: {
    ...(expoPreset.moduleNameMapper || {}),
    ...(rtlPreset.moduleNameMapper || {}),
    '^@/(.*)$': '<rootDir>/src/$1',
    'react-native-url-polyfill/auto': '<rootDir>/__mocks__/react-native-url-polyfill-auto.js',
    '@react-native-async-storage/async-storage': '<rootDir>/__mocks__/async-storage.js',
    'react-native-reanimated': '<rootDir>/__mocks__/react-native-reanimated.js',
    'react-native/Libraries/Animated/NativeAnimatedHelper': '<rootDir>/__mocks__/native-animated-helper.js',
    'react-native-svg': '<rootDir>/__mocks__/react-native-svg.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|react-native-.*|@react-native-.*|@tamagui/.*)'
  ],
  testPathIgnorePatterns: ['/node_modules/', 'rn\\.smoke\\.'],
  testEnvironment: 'jsdom'
}

const rnSmokeProject = {
  displayName: 'rn-smoke',
  rootDir: __dirname,
  ...expoPreset,
  ...rtlPreset,
  testMatch: ['<rootDir>/__tests__/**/*rn.smoke.*.[tj]s?(x)'],
  setupFilesAfterEnv: [
    ...(expoPreset.setupFilesAfterEnv || []),
    '<rootDir>/jest.setup.js'
  ],
  moduleNameMapper: {
    ...(expoPreset.moduleNameMapper || {}),
    ...(rtlPreset.moduleNameMapper || {}),
    '^@/(.*)$': '<rootDir>/src/$1',
    'react-native-url-polyfill/auto': '<rootDir>/__mocks__/react-native-url-polyfill-auto.js',
    '@react-native-async-storage/async-storage': '<rootDir>/__mocks__/async-storage.js',
    'react-native-reanimated': '<rootDir>/__mocks__/react-native-reanimated.js',
    'react-native/Libraries/Animated/NativeAnimatedHelper': '<rootDir>/__mocks__/native-animated-helper.js',
'react-native-svg': '<rootDir>/__mocks__/react-native-svg.js',
    'expo-router': '<rootDir>/__mocks__/expo-router.js',
    'expo': '<rootDir>/__mocks__/expo.js',
    'expo-asset': '<rootDir>/__mocks__/expo-asset.js',
    'expo-modules-core': '<rootDir>/__mocks__/expo-modules-core.js',
'expo-local-authentication': '<rootDir>/__mocks__/expo-local-authentication.js',
    'react-native-safe-area-context': '<rootDir>/__mocks__/react-native-safe-area-context.js',
    'tamagui': '<rootDir>/__mocks__/tamagui.js',
    '@tamagui/lucide-icons': '<rootDir>/__mocks__/tamagui-lucide-icons.js',
    // Force react-test-renderer to 18.x path from root to avoid 19.x pulled by presets
'react-test-renderer': '<rootDir>/node_modules/react-test-renderer',
    '^react-test-renderer/(.*)$': '<rootDir>/node_modules/react-test-renderer/$1'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|react-native-.*|@react-native-.*|@tamagui/.*)'
  ],
  testEnvironment: 'jsdom'
}

module.exports = baseProject
