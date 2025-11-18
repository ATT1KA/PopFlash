const baseConfig = require('@popflash/config-eslint');

const extendsConfig = Array.from(
  new Set([
    ...(baseConfig.extends ?? []),
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-native/all',
  ]),
);

const plugins = Array.from(
  new Set([...(baseConfig.plugins ?? []), 'react', 'react-hooks', 'react-native']),
);

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
  extends: extendsConfig,
  plugins,
  settings: {
    ...(baseConfig.settings ?? {}),
    react: {
      version: 'detect',
    },
    'import/resolver': {
      ...(baseConfig.settings?.['import/resolver'] ?? {}),
      typescript: {
        ...(baseConfig.settings?.['import/resolver']?.typescript ?? {}),
        project: [...new Set([...projectArray, __dirname + '/tsconfig.json'])],
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
    'react/react-in-jsx-scope': 'off',
    'react-native/no-inline-styles': 'off',
  },
};