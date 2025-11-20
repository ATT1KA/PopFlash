const path = require('path');

const baseConfig = require('@popflash/config-eslint');

const resolverProject = baseConfig.settings?.['import/resolver']?.typescript?.project;
const projectArray = Array.isArray(resolverProject)
  ? resolverProject
  : resolverProject
    ? [resolverProject]
    : [];

module.exports = {
  ...baseConfig,
  env: {
    ...(baseConfig.env ?? {}),
    'react-native/react-native': true,
  },
  plugins: [...new Set([...(baseConfig.plugins ?? []), 'react', 'react-hooks', 'react-native'])],
  extends: [
    ...(baseConfig.extends ?? []),
    'plugin:react/recommended',
    'plugin:react-native/all',
    'plugin:react-hooks/recommended',
  ],
  settings: {
    ...(baseConfig.settings ?? {}),
    react: {
      version: 'detect',
    },
    'import/resolver': {
      ...(baseConfig.settings?.['import/resolver'] ?? {}),
      typescript: {
        ...(baseConfig.settings?.['import/resolver']?.typescript ?? {}),
        project: [...new Set([...projectArray, path.resolve(__dirname, 'tsconfig.json')])],
      },
      node: {
        ...(baseConfig.settings?.['import/resolver']?.node ?? {}),
        moduleDirectory: ['node_modules', '../../node_modules'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    ...(baseConfig.rules ?? {}),
    'react-native/no-raw-text': 'off',
  },
};