module.exports = {
  css: {
    extract: false
  },
  configureWebpack: {
    entry: {
      'zigbee2mqtt-networkmap': './src/zigbee2mqtt-networkmap.js'
    },
    output: {
      filename: '[name].js'
    },
    optimization: {
      splitChunks: false
    }
  },
  productionSourceMap: false
}
