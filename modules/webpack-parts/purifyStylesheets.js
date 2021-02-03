const PurgecssPlugin = require('purgecss-webpack-plugin')

const purifyStylesheets = ({paths}) => ({
  plugins: [new PurgecssPlugin({paths})],
});

module.exports = purifyStylesheets;
