const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './examples/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  plugins: [
    // 以全局变量的形式引入包
    new webpack.ProvidePlugin({
      '_': 'lodash',
      '$': 'jquery',
    }),
  ],
  optimization: {
    minimize: false,
  },
};