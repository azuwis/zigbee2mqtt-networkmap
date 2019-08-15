module.exports = {
  css: {
    extract: false
  },
  configureWebpack: {
    output: {
      chunkFilename: '[name].js',
      filename: '[name].js'
    },
    optimization: {
      splitChunks: false
    }
  },
  productionSourceMap: false
}
