import { defineCustomElement } from 'vue'
import Zigbee2mqttNetworkmapVue from './components/Zigbee2mqttNetworkmap.vue'

const Zigbee2mqttNetworkmapBase = defineCustomElement(Zigbee2mqttNetworkmapVue)

class Zigbee2mqttNetworkmap extends Zigbee2mqttNetworkmapBase {
  setConfig (config) {
    this.config = config
  }
}

window.customElements.define('zigbee2mqtt-networkmap', Zigbee2mqttNetworkmap)
