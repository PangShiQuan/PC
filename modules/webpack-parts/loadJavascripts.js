const babelOptions = require('../../babel.config');

const loadJavaScripts = ({include = '', exclude = /(node_modules)/}) => ({
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: [...include],
        exclude,
        use: {
          loader: 'babel-loader',
          options: babelOptions,
        },
      },
    ],
  },
});

module.exports = loadJavaScripts;
