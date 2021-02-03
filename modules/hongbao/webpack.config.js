const path = require('path');
const fs = require('fs');
// const glob = require('glob');

const {mergeConfig, webpack, ...configOn} = require('../webpack-parts');
const PATHS = require('../../paths');

const modules = path.resolve(__dirname, '..');
const chunks = ['app', 'manifest', 'vendor'];
const javascriptAssetPath = 'assets/javascripts/';

function resolvePath(dir) {
  const refPath = path.resolve(PATHS.hongBaoCurrentClientDir, dir);

  return fs.existsSync(refPath)
    ? refPath
    : path.resolve(PATHS.hongBaoDefaultClientDir, dir);
}

const commonConfig = mergeConfig([
  {
    entry: {
      vendor: ['core-js/stable', 'regenerator-runtime/runtime', 'whatwg-fetch'],
      app: [`${PATHS.hongbaoApp}/index.js`],
    },
    output: {
      path: PATHS.hongbaoBuild,
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
        animate: PATHS.animate,
        helper: PATHS.helperDir,
        polyfill: PATHS.polyfillDir,
        moduleUtils: PATHS.moduleUtils,
        src: PATHS.srcDir,
        config: PATHS.configDir,
        styles: PATHS.appStylesDir,
        currentClientDir: PATHS.currentClientDir,
        defaultClientDir: PATHS.defaultClientDir,
        currentClientAssets: path.resolve(PATHS.currentClientDir, 'assets'),
        module_utils: PATHS.moduleUtils,
        hb_pages: path.resolve(PATHS.hongbaoApp, 'pages'),
        hb_utils: path.resolve(PATHS.hongbaoApp, 'utils'),
        hb_vendors: path.resolve(PATHS.hongbaoApp, 'vendors'),
        hb_assets: resolvePath('assets'),
        hb_stylesheets: resolvePath('stylesheets'),
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
      PATHS.hongbaoApp,
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
    port: 5003,
    proxy: {
      '/api': {
        target: 'http://192.168.1.93:7500',
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
  //   paths: glob.sync(`${PATHS.hongbaoApp}/**/*`, {nodir: true}),
  // }),
  configOn.optimizeBundlesPart(),
  configOn.attachRevisionPart(),
]);

module.exports = () => {
  const isProd = process.env.NODE_ENV === 'production';
  const indexTitle = '财神来派红包了！';
  const options = {
    inject: true,
    appMountId: 'root',
    title: indexTitle,
    template: resolvePath('index.ejs'),
  };
  const devPages = [
    configOn.loadHtmlPart({
      options: {
        ...options,
        filename: 'hongbao/index.html',
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
