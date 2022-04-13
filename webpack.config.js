const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
  mode: 'production',
  entry: {
    'virtualScrollTable': './src/components/virtualScrollTable/virtualScrollTableDynamic.vue',
    'virtualScrollTableDynamic': './src/components/virtualScrollTable/virtualScrollTableDynamic.vue'
  },
  output: {
    filename: '[name].js',
    library: {
      name: 'test',
      type: 'umd',
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: ['vue-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.js$/,
        use: ['babel-loader'],
      },
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
  ],
  optimization: {
    minimize: false,
  },
  externals: {
    vue: 'vue'
  },
}