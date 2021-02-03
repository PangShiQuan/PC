const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const OPTIONS = {
  preset: ['default', {discardComments: {removeAllButFirst: true}}],
};

const minifyStyles = ({options = OPTIONS} = {}) => ({
  plugins: new OptimizeCSSAssetsPlugin({
    cssProcessorOptions: options,
  }),
});

module.exports = minifyStyles;
