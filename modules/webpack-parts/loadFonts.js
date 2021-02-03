const path = require('path');

const loadFonts = ({include, exclude} = {}) => ({
  module: {
    rules: [
      {
        test: /\.(eot|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        include,
        exclude,
        use: {
          loader: 'url-loader',
          options: {
            name: '[name].[ext]?[hash:8]',
            publicPath: (url, resourcePath, context) => {
              const dir =
                process.env.NODE_ENV === 'development'
                  ? ''
                  : `/${
                      path.relative(context, resourcePath).split(path.sep)[0]
                    }`;
              return `${dir}/assets/static/${url}`;
            },
            outputPath: 'assets/static',
          },
        },
      },
    ],
  },
});

module.exports = loadFonts;
