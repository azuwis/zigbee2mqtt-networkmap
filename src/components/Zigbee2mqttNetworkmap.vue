<template>
    <ha-card>
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
  props: ['hass'],
  data () {
    return {
      initialized: false,
      config: {},
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
        size: Object.assign({ h: 400 }, config.size)
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
      this.hass.callService('mqtt', 'publish', {
        topic: 'zigbee2mqtt/bridge/networkmap',
        payload: 'raw'
      })
    },
    update (updateState = false) {
      if (updateState) {
        this.state = this.hass.states[this.config.entity].state
      }
      const attr = this.hass.states[this.config.entity].attributes
      if (!attr.nodes && !this.initialized) {
        this.initialized = true
        this.refresh()
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
