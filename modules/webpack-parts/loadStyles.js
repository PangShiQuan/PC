const presetEnv = require('postcss-preset-env');
const reporter = require('postcss-reporter');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDev = process.env.NODE_ENV === 'development';

const loadStyles = ({
  include,
  exclude,
  useInline = false,
  useModules = false,
} = {}) => {
  let localIdentName;

  if (useModules) {
    if (isDev) localIdentName = '[name]__[local]--[hash:base64:5]';
    else localIdentName = '[local]--[hash:base64:5]';
  } else if (isDev) localIdentName = '[name]--[hash:base64:5]';
  else localIdentName = '[hash:base64:5]';
  // compatibility issue with IE during development, the runtime compiled with es 6
  const miniCssExtract = () => ({
    loader: MiniCssExtractPlugin.loader,
    options: {
      hmr: process.env.NODE_ENV === 'development',
    },
  });
  const styleLoader = () => ({
    loader: 'style-loader',
    options: {
      convertToAbsoluteUrls: true,
      hmr: true,
      sourceMap: true,
    },
  });
  const cssLoader = loadersCount => ({
    loader: 'css-loader',
    options: {
      sourceMap: useInline,
      modules: useModules,
      localIdentName,
      importLoaders: loadersCount,
    },
  });
  const postCssLoader = () => ({
    loader: 'postcss-loader',
    options: {
      ident: 'postcss',
      sourceMap: useInline,
      plugins: () => [
        presetEnv({
          preserve: false,
        }),
        reporter({
          clearReportedMessages: true,
        }),
      ],
    },
  });
  const resolveUrlLoader = () => ({
    loader: 'resolve-url-loader',
  });
  const lessLoader = () => ({
    loader: 'less-loader',
    options: {
      sourceMap: useInline,
    },
  });
  return {
    module: {
      rules: [
        {
          test: /\.(le|c)ss$/,
          exclude,
          include,
          use: [
            process.env.NODE_ENV === 'development'
              ? styleLoader()
              : miniCssExtract(),
            cssLoader(3),
            postCssLoader(),
            resolveUrlLoader(),
            lessLoader(),
          ],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'assets/styles/[name].css?[contenthash:8]',
        chunkFilename: 'assets/styles/[name].chunkfile.css?[contenthash:8]',
      }),
    ],
  };
};

module.exports = loadStyles;
