const path = require('node:path');

module.exports = {
  mode: 'none',

  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9000,
  },
};
