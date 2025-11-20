import type { ConfigContext, ExpoConfig } from '@expo/config';

const NAME = 'PopFlash Mobile';
const SLUG = 'popflash-mobile';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: NAME,
  slug: SLUG,
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'popflash',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  platforms: ['ios', 'android', 'web'],
  plugins: ['expo-router'],
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true,
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.popflash.mobile',
    buildNumber: '1.0.0',
  },
  android: {
    package: 'com.popflash.mobile',
    versionCode: 1,
  },
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:4000',
    releaseChannel: process.env.EXPO_PUBLIC_RELEASE_CHANNEL ?? 'development',
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? undefined,
    },
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
});
