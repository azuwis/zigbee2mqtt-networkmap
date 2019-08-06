import Vue from 'vue'
import vueCustomElement from 'vue-custom-element'
import Zigbee2mqttNetworkmap from './components/Zigbee2mqttNetworkmap'

Vue.use(vueCustomElement)
Vue.config.productionTip = false

Vue.customElement('zigbee2mqtt-networkmap', Zigbee2mqttNetworkmap, {
  constructorCallback() {
    this.setConfig = (config) => {
      this.config = config
    }
  },
  connectedCallback() {
    const ready = () => {
      this.getVueInstance().config = this.config
    }
    this.addEventListener('vce-ready', ready)
  }
});
