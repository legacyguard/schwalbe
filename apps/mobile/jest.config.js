module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.(test|spec).[jt]s?(x)','!**/__tests__/**/login.rn.smoke.test.ts'],
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    'react-native-url-polyfill/auto': '<rootDir>/__mocks__/react-native-url-polyfill-auto.js',
    '@react-native-async-storage/async-storage': '<rootDir>/__mocks__/async-storage.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|react-native-.*|@react-native-.*|@tamagui/.*)'
  ]
};
