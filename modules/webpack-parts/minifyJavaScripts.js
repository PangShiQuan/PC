const TerserJSPlugin = require('terser-webpack-plugin');

const minifyJavaScript = () => ({
  plugins: new TerserJSPlugin({
    parallel: true,
  }),
});

module.exports = minifyJavaScript;
