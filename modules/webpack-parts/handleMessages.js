const WebpackMessages = require('webpack-messages');

const handleMessages = () => ({
  plugins: [
    new WebpackMessages({
      name: 'client',
      logger: str => console.log(`>> ${str}`),
    }),
  ],
});

module.exports = handleMessages;
