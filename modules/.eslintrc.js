// ! be advise, all config should be either change to warning or extend only rather than remove in case of obstacle
const PATHS = require('../paths');

module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:promise/recommended',
    'eslint-config-airbnb-base',
    'eslint-config-airbnb-base/rules/strict',
    'prettier',
  ],
  parser: 'babel-eslint',
  parserOptions: {
    allowImportExportEverywhere: true,
  },
  plugins: ['babel', 'no-inferred-method-name', 'promise', 'compat'],
  globals: {
    initGeetest: false,
  },
  rules: {
    'babel/camelcase': 1,
    'babel/no-invalid-this': 1,
    'babel/no-unused-expressions': 1,
    'babel/object-curly-spacing': 1,
    'babel/semi': 1,
    'class-methods-use-this': 1,
    'compat/compat': 1,
    'consistent-return': 0,
    'import/namespace': [2, {allowComputed: true}],
    'import/no-extraneous-dependencies': [
      2,
      {devDependencies: ['webpack-parts/**/*.js', '**/*.config.js']},
    ],
    'import/prefer-default-export': 1,
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
    radix: [1, 'as-needed'],
  },
  settings: {
    'import/resolver': {
      // only this resolver fit current constraint while other resolver incur import lint failure
      alias: [
        ['helper', PATHS.helperDir],
        ['polyfill', PATHS.polyfillDir],
        ['config', PATHS.configDir],
        ['moduleUtils', PATHS.moduleUtils],
        ['hb_pages', `${PATHS.hongbaoApp}/pages`],
        ['hb_utils', `${PATHS.hongbaoApp}/utils`],
        ['hb_vendors', `${PATHS.hongbaoApp}/vendors`],
        ['hb_assets', `${PATHS.hongBaoCurrentClientDir}/assets`],
        ['hb_stylesheets', `${PATHS.hongBaoCurrentClientDir}/stylesheets`],
      ],
    },
  },
};
