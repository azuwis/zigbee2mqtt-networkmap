<template>
  <ha-card>
    <v-style>
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
    </v-style>
    <d3-network :net-nodes="nodes" :net-links="links" :options="options" :link-cb="link_cb" />
    <svg width="0" height="0">
      <defs>
        <marker id="m-end" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth" >
          <path d="M0,0 L0,6 L9,3 z"></path>
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
        nodeSize: config.node_size || 16,
        size: {
          h: config.height || 400
        }
      }
    }
  },
  watch: {
    hass (newHass, oldHass) {
      const entity = this.config.entity
      if (newHass && entity) {
        const newAttr = newHass.states[entity].attributes
        var oldAttr = null
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
    }
  },
  methods: {
    link_cb (link) {
      link._svgAttrs = { 'marker-end': 'url(#m-end)' }
      return link
    },
    merge (target, source, tkey, skey, map) {
      const store = {}
      if (source) {
        source.forEach(e => {
          const key = skey(e)
          store[key] = map(e)
        })
      }
      target.forEach((e, i) => {
        const key = tkey(e)
        if (key in store) {
          for (const k in store[key]) {
            e[k] = store[key][k]
          }
          delete store[key]
        } else {
          this.$delete(target, i)
        }
      })
      for (const k in store) {
        target.push(store[k])
      }
    },
    refresh () {
      this.state = 'Refreshing...'
      const mqttBaseTopic = this.config.mqtt_base_topic || 'zigbee2mqtt'
      this.hass.callService('mqtt', 'publish', {
        topic: mqttBaseTopic + '/bridge/networkmap',
        payload: 'raw'
      })
    },
    update () {
      const attr = this.hass.states[this.config.entity].attributes
      if (!attr.nodes && !this.initialized) {
        this.initialized = true
        this.refresh()
        return
      }
      this.merge(this.nodes, attr.nodes, d => d.id, d => d.ieeeAddr, d => {
        return {
          id: d.ieeeAddr,
          name: d.type === 'Coordinator' ? 'Coordinator' : d.friendlyName,
          _cssClass: d.type.toLowerCase()
        }
      })
      this.merge(this.links, attr.links, d => d.sid + d.tid, d => d.sourceIeeeAddr + d.targetIeeeAddr, d => {
        return {
          sid: d.sourceIeeeAddr,
          tid: d.targetIeeeAddr,
          name: d.lqi
        }
      })
    }
  }
}
</script>
