const path = require('path');
// const glob = require('glob');

const {mergeConfig, webpack, ...configOn} = require('../webpack-parts');

const PATHS = require('../../paths');

const modules = path.resolve(__dirname, '..');
const isProd = process.env.NODE_ENV === 'production';
const chunks = ['app', 'manifest', 'vendor'];
const javascriptAssetPath = 'assets/javascripts/';

const commonConfig = mergeConfig([
  {
    entry: {
      vendor: ['core-js/stable', 'regenerator-runtime/runtime', 'whatwg-fetch'],
      app: [`${PATHS.loginApp}/index.${isProd ? 'min' : 'obfuscate'}.js`],
    },
    output: {
      path: PATHS.loginBuild,
      // Needed for code splitting to work in nested paths
      filename: `${javascriptAssetPath}[name].js`,
    },
    plugins: [
      new webpack.DefinePlugin({
        CLIENT: JSON.stringify(PATHS.currentClient),
      }),
      new webpack.EnvironmentPlugin({
        BABEL_ENV: 'development',
        NODE_ENV: 'development',
        PROD: false,
      }),
    ],
    resolve: {
      alias: {
        helper: PATHS.helperDir,
        openColor: PATHS.openColor,
        polyfill: PATHS.polyfillDir,
        moduleUtils: PATHS.moduleUtils,
        client: PATHS.clientDir,
        clientResolver: PATHS.clientResolverDir,
        config: PATHS.configDir,
        currentClientDir: PATHS.currentClientDir,
        defaultClientDir: PATHS.defaultClientDir,
        styles: PATHS.appStylesDir,
      },
      modules: ['node_modules', modules],
    },
    resolveLoader: {
      modules: ['node_modules', modules],
    },
  },
  configOn.handleErrorPart(),
  configOn.handleMessages(),
  configOn.loadFontsPart(),
  configOn.loadImagesPart(),
  configOn.loadJavaScriptsPart({
    include: [
      PATHS.loginApp,
      PATHS.moduleUtils,
      PATHS.helperDir,
      PATHS.currentClientDir,
      PATHS.configDir,
    ],
  }),
]);

const developmentConfig = mergeConfig([
  {
    mode: 'development',
    plugins: [new webpack.HotModuleReplacementPlugin()],
    output: {
      devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]',
    },
  },
  configOn.generateSourceMapsPart({type: 'eval-cheap-module-source-map'}),
  configOn.devServerPart({
    host: process.env.HOST,
    port: 5001,
    proxy: {
      '/api': {
        // target: 'https://sit01-201web.gri7.com/',
        target: 'https://sit01-301web.gri7.com/',
        changeOrigin: true,
      },
    },
  }),
  configOn.loadStylesPart({
    useInline: true,
  }),
]);

const productionConfig = mergeConfig([
  {
    mode: 'production',
    performance: {
      hints: 'warning', // 'error' or false are valid too
      maxEntrypointSize: 200000, // in bytes, default 250k
      maxAssetSize: 450000, // in bytes
    },
    plugins: [new webpack.HashedModuleIdsPlugin()],
    output: {
      chunkFilename: `${javascriptAssetPath}[name].chunkfile.js?v=[hash:8]`,
      filename: `${javascriptAssetPath}[name].js?v=[hash:8]`,
    },
  },
  // configOn.generateSourceMapsPart({type: 'source-map'}),
  configOn.loadStylesPart(),
  // configOn.purifyStylesheetsPart({
  //   paths: glob.sync(`${PATHS.loginApp}/**/*`, {nodir: true}),
  // }),
  configOn.optimizeBundlesPart(),
  configOn.attachRevisionPart(),
]);

module.exports = () => {
  const options = {
    inject: true,
    template: `${PATHS.loginApp}/index.ejs`,
    appMountId: 'root',
  };
  const devPages = [
    configOn.loadHtmlPart({
      options: {
        ...options,
        filename: 'login/index.html',
      },
    }),
  ];
  const prodPages = [
    configOn.loadHtmlPart({
      options: {
        ...options,
        filename: 'index.html',
        chunks,
        minify: {caseSensitive: true, collapseWhitespace: true, html5: true},
      },
    }),
  ];
  const config = isProd ? productionConfig : developmentConfig;
  const pages = isProd ? prodPages : devPages;
  return pages.map(page => mergeConfig([commonConfig, config, page]));
};
