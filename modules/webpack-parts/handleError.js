const NotifierPlugin = require('friendly-errors-webpack-plugin');
const notifier = require('node-notifier');

const handleError = () => ({
  // https://github.com/mikaelbr/node-notifier#using-webpack
  node: {
    __filename: true,
    __dirname: true,
  },
  plugins: [
    new NotifierPlugin({
      onErrors: (severity, errors) => {
        if (severity !== 'error') {
          return;
        }
        const error = errors[0];
        notifier.notify({
          title: 'Webpack error',
          message: `${severity}: ${error.name}`,
          subtitle: error.file || '',
        });
      },
    }),
  ],
});

module.exports = handleError;
