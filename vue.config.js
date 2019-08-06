module.exports = {
  css: {
    extract: false
  },
  configureWebpack: {
    output: {
      filename: 'zigbee2mqtt-networkmap.js'
    },
    optimization: {
      splitChunks: false
    }
  }
}
