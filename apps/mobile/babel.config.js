module.exports = function (api) {
  api.cache(true);
  const isWeb = process.env.EXPO_PUBLIC_PLATFORM === 'web';
  const isTest = process.env.NODE_ENV === 'test' || !!process.env.JEST_WORKER_ID;
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      [
        '@tamagui/babel-plugin',
        {
          components: ['tamagui', '@schwalbe/ui'],
          config: './tamagui.config.ts',
          logTimings: true,
          disableExtraction: process.env.NODE_ENV === 'development',
        },
      ],
      // Only include reanimated for native platforms (exclude web and test environments)
      ...(!isWeb && !isTest ? ['react-native-reanimated/plugin'] : []),
    ],
  };
};
