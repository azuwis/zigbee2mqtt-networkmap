<template>
  <ha-card>
    <v-style>
      .net {
        height: 100%;
        margin: 0;
      }
      .node {
        stroke: var(--zigbee2mqtt-networkmap-node-color, rgba(18, 120, 98, .7));
        stroke-width: 3px;
        -webkit-transition: fill .5s ease;
        transition: fill .5s ease;
        fill: var(--zigbee2mqtt-networkmap-node-fill-color, #dcfaf3);
      }
      .node.selected {
        stroke: #caa455;
      }
      .node.pinned {
        stroke: var(--zigbee2mqtt-networkmap-node-pinned-color, rgba(190, 56, 93, .6));
      }
      .link {
        stroke: var(--zigbee2mqtt-networkmap-link-color, rgba(18, 120, 98, .5));
      }
      .link, .node {
        stroke-linecap: round;
      }
      .link:hover, .node:hover {
        stroke: var(--zigbee2mqtt-networkmap-hover-color, #be385d);
      }
      .node:hover {
        stroke-width: 5px;
      }
      .link.selected {
        stroke: var(--zigbee2mqtt-networkmap-link-selected-color, rgba(202, 164, 85, .6));
      }
      .curve {
        fill: none;
      }
      .link-label, .node-label {
        fill: var(--zigbee2mqtt-networkmap-label-color, #127862);
      }
      .node-label {
        stroke: var(--ha-card-background, var(--card-background-color, #fff));
        stroke-width: 0.5em;
        paint-order: stroke;
        stroke-opacity: 0.7;
        stroke-linejoin: round;
      }
      .link-label {
        dominant-baseline: text-after-edge;
        dominant-baseline: ideographic;
        text-anchor: middle;
      }
      #m-end path {
        fill: var(--zigbee2mqtt-networkmap-arrow-color, rgba(18, 120, 98, 0.7));
      }
      .node.coordinator {
        stroke: var(--zigbee2mqtt-networkmap-node-coordinator-color, rgba(224, 78, 93, .7));
      }
      .node.router {
        stroke: var(--zigbee2mqtt-networkmap-node-router-color, rgba(0, 165, 255, .7));
      }
      .flex {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      {{ css }}
    </v-style>
    <d3-network :net-nodes="nodes" :net-links="links" :options="options" :link-cb="link_cb" ref="net" />
    <svg width="0" height="0">
      <defs>
        <marker id="m-end" markerWidth="10" markerHeight="10" refX="12" refY="2" orient="auto" markerUnits="strokeWidth" >
          <path d="M0,0 L0,4 L8,2 z"></path>
        </marker>
      </defs>
    </svg>
    <div class="card-actions">
      <div class="flex">
        <mwc-button @click="refresh">Refresh</mwc-button>
        <div class="time">{{ state }}</div>
      </div>
    </div>
  </ha-card>
</template>

<script>
import D3Network from 'vue-d3-network'
import isEqual from 'lodash.isequal'

export default {
  components: {
    D3Network
  },
  data () {
    return {
      initialized: false,
      config: {},
      hass: null,
      nodes: [],
      links: [],
      state: ''
    }
  },
  computed: {
    options () {
      const config = this.config
      return {
        fontSize: config.font_size || 12,
        force: config.force || 3000,
        linkLabels: true,
        linkWidth: config.link_width || 2,
        nodeLabels: true,
        nodeSize: config.node_size || 16
      }
    },
    css () {
      return this.config.css || ''
    }
  },
  watch: {
    hass (newHass, oldHass) {
      const entity = this.config.entity
      if (newHass && entity && newHass.states[entity]) {
        const newAttr = newHass.states[entity].attributes
        let oldAttr = null
        if (oldHass) {
          oldAttr = oldHass.states[entity].attributes
        }
        if (newAttr !== oldAttr) {
          this.state = newHass.states[entity].state
        }
        if (!isEqual(newAttr, oldAttr)) {
          this.update()
        }
      }
    },
    config (newConfig, oldConfig) {
      if (newConfig) {
        this.$refs.net.size.h = newConfig.height || 400
      }
    }
  },
  methods: {
    link_cb (link) {
      link._svgAttrs = { 'marker-end': 'url(#m-end)' }
      return link
    },
    merge (target, source, map) {
      const result = []
      const store = {}
      if (source) {
        source.forEach(e => {
          const r = map(e)
          store[r.id] = r
        })
      }
      target.forEach((e, i) => {
        const key = e.id
        if (key in store) {
          for (const k in store[key]) {
            e[k] = store[key][k]
          }
          result.push(e)
          delete store[key]
        }
      })
      for (const k in store) {
        result.push(store[k])
      }
      return result
    },
    refresh () {
      this.state = 'Refreshing...'
      const mqttBaseTopic = this.config.mqtt_base_topic || 'zigbee2mqtt'
      const mqttTopic = this.config.mqtt_topic || mqttBaseTopic + '/bridge/request/networkmap'
      const payload = this.config.mqtt_payload || { type: 'raw', routes: true }
      this.hass.callService('mqtt', 'publish', {
        topic: mqttTopic,
        payload: JSON.stringify(payload)
      })
    },
    transform (attr, config) {
      return {
        nodes: {
          source: attr.nodes,
          map: d => {
            return {
              id: d.ieeeAddr,
              name: d.type === 'Coordinator' ? ' ' : d.friendlyName,
              _cssClass: d.type ? d.type.toLowerCase() : ''
            }
          }
        },
        links: {
          source: attr.links.filter(
            d => {
              const nodes = attr.nodes.map(d => d.ieeeAddr)
              return nodes.includes(d.source.ieeeAddr) &&
              nodes.includes(d.target.ieeeAddr)
            }
          ),
          map: d => {
            return {
              id: d.source.ieeeAddr + d.target.ieeeAddr,
              sid: d.source.ieeeAddr,
              tid: d.target.ieeeAddr,
              name: d.linkquality
            }
          }
        }
      }
    },
    update () {
      const attr = this.hass.states[this.config.entity].attributes
      if (!attr.nodes && !this.initialized) {
        this.initialized = true
        this.refresh()
        return
      }
      const { nodes, links } = this.transform(attr, this.config)
      this.nodes = this.merge(this.nodes, nodes.source, nodes.map)
      this.links = this.merge(this.links, links.source, links.map)
    }
  },
  mounted () {
    setTimeout(() => {
      this.$refs.net.onResize()
    }, 100)
  }
}
</script>
