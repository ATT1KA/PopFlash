module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      require.resolve('expo-router/babel'),
      [
        'module-resolver',
        {
          root: ['.'],
          extensions: ['.ts', '.tsx', '.js', '.jsx'],
          alias: {
            '@app': './app',
            '@components': './components',
            '@hooks': './hooks',
            '@lib': './lib',
            '@types': './types',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};