const HtmlWebpackPlugin = require('html-webpack-plugin');

const loadHtml = ({options}) => ({
  plugins: [new HtmlWebpackPlugin(options)],
});

module.exports = loadHtml;
