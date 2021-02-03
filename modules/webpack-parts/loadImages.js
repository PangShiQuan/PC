const path = require('path');

const loadImages = ({include, exclude} = {}) => ({
  module: {
    rules: [
      {
        test: /\.(png|jpeg|jpg|gif|svg)$/,
        include,
        exclude,
        use: [
          {
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

                // TODO  解决红包logo不能正确解析路径
                if (/(logo|logoHongBao).png/.test(url)) {
                   return `assets/static/${url}`;
                } else {
                  return `${dir}/assets/static/${url}`;
                }
              },
              outputPath: 'assets/static',
              limit: 5000,
            },
          },
        ],
      },
    ],
  },
});

module.exports = loadImages;
