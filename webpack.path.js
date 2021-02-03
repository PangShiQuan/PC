const path = require('path');
const PATHS = require('./paths') ;

module.exports =  {
  resolve: {
    alias: {
      client: PATHS.clientDir,
      clientResolver: PATHS.clientResolverDir,
      config: PATHS.configDir,
      helper: PATHS.helperDir,
      polyfill: PATHS.polyfillDir,
      styles: PATHS.appStylesDir,
      currentClientDir: PATHS.currentClientDir,
      defaultClientDir: PATHS.defaultClientDir,
      assets: path.resolve(PATHS.srcDir, 'assets'),
      utils: path.resolve(PATHS.srcDir, 'utils'),
      components: path.resolve(PATHS.srcDir, 'components'),
      messaging: path.resolve(PATHS.srcDir, 'messaging'),
      pages: path.resolve(PATHS.srcDir, 'pages'),
      services: path.resolve(PATHS.srcDir, 'services'),
      moment: path.resolve(PATHS.nodeModules, 'moment'), // prevent included in multiple output bundle due to minor version discrepancy
    },
  },
};
