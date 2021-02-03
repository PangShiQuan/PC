const devServer = ({host, port, proxy} = {}) => ({
  devServer: {
    clientLogLevel: 'error',
    contentBase: './',
    historyApiFallback: true,
    hotOnly: true,
    noInfo: true,
    overlay: true,
    host,
    port,
    proxy,
  },
});

module.exports = devServer;
