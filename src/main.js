import Vue from 'vue'
import vueCustomElement from 'vue-custom-element'
import Zigbee2mqttNetworkmap from './components/Zigbee2mqttNetworkmap'

Vue.use(vueCustomElement)
Vue.config.productionTip = false

Vue.customElement('zigbee2mqtt-networkmap', Zigbee2mqttNetworkmap, {
  shadow: true,
  shadowCss: `
canvas{position:absolute;top:0;left:0}.net{height:100%;margin:0}.node{stroke:rgba(18,120,98,.7);stroke-width:3px;-webkit-transition:fill .5s ease;transition:fill .5s ease;fill:#dcfaf3}.node.selected{stroke:#caa455}.node.pinned{stroke:rgba(190,56,93,.6)}.link{stroke:rgba(18,120,98,.5)}.link,.node{stroke-linecap:round}.link:hover,.node:hover{stroke:#be385d;stroke-width:5px}.link.selected{stroke:rgba(202,164,85,.6)}.curve{fill:none}.link-label,.node-label{fill:#127862}.link-label{-webkit-transform:translateY(-.5em);transform:translateY(-.5em);text-anchor:middle}
#m-end path {
  fill: rgba(18, 120, 98, 0.7);
}
.node.coordinator {
  stroke: rgba(224, 78, 93, .7);
}
.node.router {
  stroke: rgba(0, 165, 255, .7);
}
.flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.time {
  color: var(--secondary-text-color);
}
`,
  constructorCallback () {
    if (!this.setConfig) {
      this.setConfig = (config) => {
        this.config = config
      }
    }
  },
  connectedCallback () {
    if (!this.ready) {
      this.ready = () => {
        const vm = this.getVueInstance()
        vm.config = this.config
        vm.update(true)
      }
      this.addEventListener('vce-ready', this.ready)
    }
  }
})
