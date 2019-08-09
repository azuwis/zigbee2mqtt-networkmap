import Vue from 'vue'
import wrap from '@vue/web-component-wrapper'
import Zigbee2mqttNetworkmapVue from './components/Zigbee2mqttNetworkmap'

Vue.component('v-style', {
  render: function (createElement) {
    return createElement('style', this.$slots.default)
  }
})

const Zigbee2mqttNetworkmapWrap = wrap(Vue, Zigbee2mqttNetworkmapVue)

class Zigbee2mqttNetworkmap extends Zigbee2mqttNetworkmapWrap {
  setConfig (config) {
    this.config = config
  }
  connectedCallback () {
    super.connectedCallback()
    this.vueComponent.config = this.config
  }
}

window.customElements.define('zigbee2mqtt-networkmap', Zigbee2mqttNetworkmap)
