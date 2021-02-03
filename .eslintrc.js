// ! be advise, all config should be either change to warning or extend only rather than remove in case of obstacle
const path = require('path');

const PATHS = require('./paths');

module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:jsx-a11y/recommended',
    'plugin:promise/recommended',
    'plugin:react/recommended',
    'plugin:redux-saga/recommended',
    'airbnb',
    'react-app',
    'prettier',
    'prettier/react',
  ],
  parserOptions: {
    allowImportExportEverywhere: true,
  },
  plugins: [
    'babel',
    'no-inferred-method-name',
    'promise',
    'compat',
    'redux-saga',
  ],
  rules: {
    'babel/camelcase': 1,
    'babel/no-invalid-this': 1,
    'babel/no-unused-expressions': 1,
    'babel/object-curly-spacing': 1,
    'babel/semi': 1,
    'class-methods-use-this': 1,
    'compat/compat': 1,
    'consistent-return': 0,
    'import/no-dynamic-require': 1,
    'import/namespace': [2, {allowComputed: true}],
    'import/no-extraneous-dependencies': [
      2,
      {devDependencies: ['scripts/*.js', '**/*.config.js']},
    ],
    'import/prefer-default-export': 1,
    'jsx-a11y/click-events-have-key-events': 1,
    'linebreak-style': 0,
    'no-bitwise': 1,
    'no-plusplus': [1, {allowForLoopAfterthoughts: true}],
    'no-underscore-dangle': 1,
    'no-use-before-define': [2, {functions: false}],
    'no-var': 1,
    'one-var': [2, {initialized: 'never', uninitialized: 'always'}],
    'prefer-const': [
      2,
      {
        destructuring: 'all',
      },
    ],
    'prefer-promise-reject-errors': 1,
    'react/button-has-type': [
      1,
      {
        button: true,
        submit: true,
        reset: true,
      },
    ],
    'react/destructuring-assignment': [1, 'always', {ignoreClassFields: true}],
    'react/jsx-no-target-blank': [1, {enforceDynamicLinks: 'never'}],
    'react/no-array-index-key': 1,
    'react/no-unused-state': 1,
    'react/prop-types': [1, {ignore: ['dispatch'], skipUndeclared: true}],
    'react/require-default-props': 1,
    'react/sort-comp': 1,
    radix: [1, 'as-needed'],
  },
  globals: {
    CLIENT: true,
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['styles', path.resolve(PATHS.srcDir, 'styles')],
          ['assets', path.resolve(PATHS.srcDir, 'assets')],
          ['client', path.resolve(PATHS.srcDir, 'client')],
          ['utils', path.resolve(PATHS.srcDir, 'utils')],
          ['components', path.resolve(PATHS.srcDir, 'components')],
          ['messaging', path.resolve(PATHS.srcDir, 'messaging')],
          ['pages', path.resolve(PATHS.srcDir, 'pages')],
          ['services', path.resolve(PATHS.srcDir, 'services')],
          ['helper', PATHS.helperDir],
          ['polyfill', PATHS.polyfillDir],
          ['config', PATHS.configDir],
          ['client', PATHS.clientDir],
          ['currentClientDir', PATHS.currentClientDir],
          ['defaultClientDir', PATHS.defaultClientDir],
          ['clientResolver', PATHS.clientResolverDir],
        ],
        extensions: ['.js', '.jsx', '.json', '.less'],
      },
    },
    react: {
      version: 'detect',
    },
  },
};
