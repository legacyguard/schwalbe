const expoPreset = require('jest-expo/jest-preset')
const rtlPreset = require('@testing-library/react-native/jest-preset')

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
    // Do NOT mock 'react-native' itself; rely on jest-expo preset
    'react-native-safe-area-context': '<rootDir>/__mocks__/react-native-safe-area-context.js',
    'tamagui': '<rootDir>/__mocks__/tamagui.js',
    '@tamagui/lucide-icons': '<rootDir>/__mocks__/tamagui-lucide-icons.js',
    '^react-test-renderer$': '<rootDir>/__mocks__/react-test-renderer18.js',
    '^react-test-renderer/(.*)$': '<rootDir>/node_modules/react-test-renderer/$1'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|react-native-.*|@react-native-.*|@tamagui/.*)'
  ],
  testEnvironment: 'node'
}

module.exports = rnSmokeProject
