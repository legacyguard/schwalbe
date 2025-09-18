const expoPreset = require('jest-expo/jest-preset')
const rtlPreset = require('@testing-library/react-native/jest-preset')

module.exports = {
  ...expoPreset,
  ...rtlPreset,
  testMatch: ['**/__tests__/**/*.(test|spec).[jt]s?(x)', '!**/__tests__/**/login.rn.smoke.test.ts'],
  setupFilesAfterEnv: [
    ...(expoPreset.setupFilesAfterEnv || []),
    ...(rtlPreset.setupFilesAfterEnv || []),
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
  ]
};
