const mergeConfig = require('webpack-merge');
const webpack = require('webpack');

const attachRevisionPart = require('./revision');
const devServerPart = require('./devServer');
const generateSourceMapsPart = require('./generateSourceMaps');
const handleErrorPart = require('./handleError');
const loadFontsPart = require('./loadFonts');
const loadHtmlPart = require('./loadHtml');
const loadImagesPart = require('./loadImages');
const loadJavaScriptsPart = require('./loadJavascripts');
const loadStylesPart = require('./loadStyles');
const minifyJavaScriptsPart = require('./minifyJavaScripts');
const minifyStylesPart = require('./minifyStyles');
const optimizeBundlesPart = require('./optimizeBundles');
const purifyStylesheetsPart = require('./purifyStylesheets');
const handleMessages = require('./handleMessages');

module.exports = {
  attachRevisionPart,
  devServerPart,
  generateSourceMapsPart,
  handleErrorPart,
  loadFontsPart,
  loadHtmlPart,
  loadImagesPart,
  loadJavaScriptsPart,
  loadStylesPart,
  minifyJavaScriptsPart,
  minifyStylesPart,
  optimizeBundlesPart,
  purifyStylesheetsPart,
  handleMessages,
  // module
  mergeConfig,
  webpack,
};
