const path = require('path');

const projectGlobs = [
  path.resolve(__dirname, '../../tsconfig.json'),
  path.resolve(__dirname, '../../packages/*/tsconfig.json'),
  path.resolve(__dirname, '../../services/*/tsconfig.json'),
  path.resolve(__dirname, '../../apps/*/tsconfig.json'),
];

module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: projectGlobs,
    tsconfigRootDir: path.resolve(__dirname, '../../'),
  },
  plugins: ['@typescript-eslint', 'import', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ],
  rules: {
    'prettier/prettier': 'error',
    'import/order': [
      'warn',
      {
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: false,
      },
    ],
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: projectGlobs,
        alwaysTryTypes: true,
      },
    },
  },
};