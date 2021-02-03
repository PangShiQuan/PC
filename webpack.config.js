const path = require('path');
const webpack = require('webpack');

const PATHS = require('./paths');

const PROD = process.env.NODE_ENV === 'production';

var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = function configuration(config) {
  const javascriptAssetPath = 'assets/javascripts/';
  const newConfig = {...config};

  newConfig.output.filename = `${javascriptAssetPath}[name].js?v=[hash:8]`;
  newConfig.output.chunkFilename = `${javascriptAssetPath}[name].chunkfile.js?v=[hash:8]`;

  newConfig.module.rules = newConfig.module.rules.map(rule => {
    if (rule.include && rule.include.toString() !== '/node_modules/') {
      const rulesInclude = Array.isArray(rule.include)
        ? rule.include
        : [rule.include];
        rule.include = [
        ...rulesInclude,
        PATHS.defaultClientDir,
        PATHS.currentClientDir,
      ];
    }

    if (rule.loader && rule.loader.includes('url-loader')) {
      // eslint-disable-next-line
      rule.options = {
        name: '[name].[ext]?[hash:8]',
        publicPath: '../../',
        outputPath: 'assets/static/',
        limit: 99000,
      };
    }
    return rule;
  });

  newConfig.plugins = newConfig.plugins.map(plugin => {
    if (plugin.filename && plugin.filename.includes('.css')) {
      // eslint-disable-next-line
      // plugin.filename = 'assets/styles/[name].css?[contenthash:8]'; // temporary remove to prevent css build name remain the same
      plugin.filename = 'assets/styles/[name].css?[hash:8]';
    }
    return plugin;
  });

  // newConfig.plugins.push(
  //   new BundleAnalyzerPlugin(),
  // );

  if (PROD) {
    newConfig.node = false;

    newConfig.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /data[\\/]packed[\\/]latest.json$/,
        path.resolve('misc', 'timezone-definitions.json'),
      ),
      new webpack.optimize.MinChunkSizePlugin({
        minChunkSize: 42500, // Minimum number of characters
      }),
      // new BundleAnalyzerPlugin(),
    );
  }

  return newConfig;
};
