const minifyJS = require('./minifyJavaScripts');
const minifyStyle = require('./minifyStyles');

const jsMinimizer = minifyJS().plugins;
const styleMinimizer = minifyStyle().plugins;

const optimizeBundles = ({minimizer = [jsMinimizer, styleMinimizer]} = {}) => ({
  optimization: {
    minimizer,
    splitChunks: {
      chunks: 'async',
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
        },
        default: {
          minChunks: 2,
          priority: -20,
          chunks: 'initial',
          reuseExistingChunk: true,
        },
      },
    },
    runtimeChunk: {
      name: 'manifest',
    },
  },
});

module.exports = optimizeBundles;
