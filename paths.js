// eslint-disable-next-line
const path = require('path');
const fs = require('fs');

const srcDir = path.resolve(__dirname, 'src');
const clientDir = path.resolve(__dirname, 'client');
const helperDir = path.resolve(__dirname, 'helper');
const modulesDir = path.resolve(__dirname, 'modules');
const buildDir = path.resolve(__dirname, 'dist');
const nodeModules = path.resolve(__dirname, 'node_modules');
const polyfillDir = path.resolve(__dirname, 'polyfill');
const miscDir = path.resolve(__dirname, 'misc');

const DEFAULT_CLIENT = 'default';

let {CLIENT = DEFAULT_CLIENT} = process.env;
let DEMO = 'false';

if (CLIENT.includes('-m')) {
  CLIENT = CLIENT.replace('-m', '');
}

if (CLIENT.includes('-demo')) {
  CLIENT = CLIENT.replace('-demo', '');
  DEMO = 'true';
}

const clientResolverDir = path.resolve(srcDir, 'client');
const resolveModules = relativePath =>
  path.resolve(__dirname, 'modules', relativePath);
const hongbaoClientDir = path.resolve(modulesDir, 'hongbao/client');
const hongBaoDefaultClientDir = path.resolve(hongbaoClientDir, DEFAULT_CLIENT);
let hongBaoCurrentClientDir = path.resolve(hongbaoClientDir, CLIENT);

if (CLIENT && !fs.existsSync(hongBaoCurrentClientDir)) {
  hongBaoCurrentClientDir = hongBaoDefaultClientDir;
}

module.exports = {
  buildDir,
  clientDir,
  clientResolverDir,
  configDir: path.resolve(clientResolverDir, 'setup.js'),
  currentClientDir: path.resolve(clientDir, CLIENT),
  defaultClientDir: path.resolve(clientDir, 'default'),
  currentClient: CLIENT,
  isDemo: DEMO,
  helperDir,
  miscDir,
  nodeModules,
  polyfillDir,
  srcDir,
  appStylesDir: path.resolve(srcDir, 'styles'),
  hongBaoCurrentClientDir,
  hongBaoDefaultClientDir,
  appEntry: path.resolve(srcDir, 'index.js'),
  animate: path.resolve(nodeModules, 'animate.less/source'),
  api: path.resolve(srcDir, 'utils/API.js'),
  hongbaoApp: resolveModules('hongbao/app'),
  hongbaoBuild: path.resolve(buildDir, 'hongbao'),
  openColor: path.resolve(nodeModules, 'open-color'),
  registerApp: resolveModules('register/app'),
  registerBuild: path.resolve(buildDir, 'register'),
  loginApp: resolveModules('login/app'),
  loginBuild: path.resolve(buildDir, 'login'),
  timeZoneDefinitions: path.resolve(miscDir, 'timezone-definitions.json'),
  moduleUtils: resolveModules('utils'),
};
