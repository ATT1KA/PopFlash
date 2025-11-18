const baseConfig = require('@popflash/config-eslint');

const extendsConfig = Array.from(
  new Set([...(baseConfig.extends ?? []), 'next', 'next/core-web-vitals']),
);

const resolverProject = baseConfig.settings?.['import/resolver']?.typescript?.project;
const projectArray = Array.isArray(resolverProject)
  ? resolverProject
  : resolverProject
    ? [resolverProject]
    : [];

module.exports = {
  ...baseConfig,
  extends: extendsConfig,
  settings: {
    ...(baseConfig.settings ?? {}),
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
};