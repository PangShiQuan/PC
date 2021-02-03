import path from 'path';
import postcssPresetEnv from 'postcss-preset-env';
import postcssReporter from 'postcss-reporter';

import {browserslist} from './package.json';
import PATHS from './paths';
import {presets as babelPresets, plugins as babelPlugins} from './babel.config';

export default {
  es5ImcompatibleVersions: true,
  entry: 'src/index.js',
  publicPath: '/',
  alias: {
    client: PATHS.clientDir,
    clientResolver: PATHS.clientResolverDir,
    config: PATHS.configDir,
    helper: PATHS.helperDir,
    polyfill: PATHS.polyfillDir,
    styles: PATHS.appStylesDir,
    currentClientDir: PATHS.currentClientDir,
    defaultClientDir: PATHS.defaultClientDir,
    assets: path.resolve(PATHS.srcDir, 'assets'),
    utils: path.resolve(PATHS.srcDir, 'utils'),
    components: path.resolve(PATHS.srcDir, 'components'),
    messaging: path.resolve(PATHS.srcDir, 'messaging'),
    pages: path.resolve(PATHS.srcDir, 'pages'),
    services: path.resolve(PATHS.srcDir, 'services'),
    plugins: path.resolve(PATHS.srcDir, 'plugins'),
    moment: path.resolve(PATHS.nodeModules, 'moment'), // prevent included in multiple output bundle due to minor version discrepancy
  },
  env: {
    development: {
      devtool: 'eval-cheap-module-source-map',
      browserslist: browserslist.development,
      // extraBabelPlugins: ['dva-hmr'], // https://github.com/dvajs/babel-plugin-dva-hmr/issues/14
    },
    production: {
      // devtool: 'source-map',
      browserslist: browserslist.production,
      extraBabelPlugins: [
        'lodash',
        'transform-react-remove-prop-types',
        '@babel/plugin-transform-react-constant-elements',
      ],
      hash: true,
      commons: [
        {
          name: 'vendor',
          minChunks(module) {
            if (module.resource && /^.*\.(css|less)$/.test(module.resource)) {
              return false;
            }
            return module.context && module.context.includes('node_modules');
          },
        },
        {
          name: 'manifest',
          minChunks: Infinity,
        },
      ],
      externals: {
        // bcrypt dependency on node native crypto module which not necessary for browser environment.
        // since webpack only does static analysis to find out what code needs to be bundled.
        // That means NodeJS crypto is included even though it’s only needed for server side.
        crypto: 'crypto',
      },
    },
  },
  define: {
    CLIENT: PATHS.currentClient,
    DEMO: PATHS.isDemo
  },
  extraPostCSSPlugins: [
    postcssPresetEnv(),
    postcssReporter({
      clearReportedMessages: true,
    }),
  ],
  extraBabelPlugins: babelPlugins.concat([
    ['import', {libraryName: 'antd', style: true}],
  ]),
  extraBabelPresets: babelPresets,
  extraBabelIncludes: [PATHS.helperDir],
  html: {
    template: path.resolve(PATHS.srcDir, 'index.ejs'),
  },
  ignoreMomentLocale: true,
  proxy: {
    '/api': {
      // target: 'https://www.513xyz.com/',
      target: 'https://sit01-301web.gri7.com/',
      changeOrigin: true,
    },
  },
};
