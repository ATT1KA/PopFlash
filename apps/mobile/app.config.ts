import type { ConfigContext, ExpoConfig } from '@expo/config';

const NAME = 'PopFlash';
const SLUG = 'popflash-mobile';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: NAME,
  slug: SLUG,
  version: '0.1.0',
  scheme: 'popflash',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  jsEngine: 'hermes',
  updates: {
    url: `https://u.expo.dev/${process.env.EXPO_PROJECT_ID ?? 'popflash-mobile'}`,
  },
  runtimeVersion: {
    policy: 'sdkVersion',
  },
  assetBundlePatterns: ['**/*'],
  platforms: ['ios', 'android', 'web'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.popflash.app',
  },
  android: {
    package: 'com.popflash.app',
    adaptiveIcon: {
      backgroundColor: '#050714',
    },
  },
  web: {
    bundler: 'metro',
  },
  plugins: ['expo-router'],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: process.env.EXPO_PROJECT_ID ?? '00000000-0000-0000-0000-000000000000',
    },
    apiUrl: process.env.API_URL ?? 'https://api.popflash.gg',
  },
});