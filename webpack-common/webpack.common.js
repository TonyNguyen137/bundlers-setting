const path = require('node:path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    index: './src/index.js',
  },

  devtool: 'inline-source-map',

  output: {
    path: path.resolve(__dirname, 'dist'),
    // assetModuleFilename: `images/${currentYear}/${currentMonth}/[name].[hash][ext]`,
    clean: true,
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],

  module: {
    rules: [
      {
        test: /\.html$/i,
        use: 'html-loader',
      },
    ],
  },
};
