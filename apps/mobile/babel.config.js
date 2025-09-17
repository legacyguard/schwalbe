module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      [
        '@tamagui/babel-plugin',
        {
          components: ['tamagui', '@schwalbe/ui'],
          config: './src/lib/tamagui.config.ts',
          logTimings: true,
          disableExtraction: process.env.NODE_ENV === 'development',
        },
      ],
      // Reanimated plugin has to be listed last
      'react-native-reanimated/plugin',
    ],
  };
};