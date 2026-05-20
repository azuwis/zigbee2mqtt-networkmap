<template>
  <v-style>
    <!-- v-style outside <ha-card> so styles land in defineCustomElement's shadow root
         instead of being slotted into ha-card's own Shadow DOM -->
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
    .node.dimmed, .link.dimmed, .node-label.dimmed, .link-label.dimmed {
      opacity: 0.15;
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
  <ha-card>
    <d3-network :net-nodes="nodes" :net-links="links" :options="options" :node-cb="node_cb" :link-cb="link_cb" @click="onSvgClick" @node-click="onNodeClick" @pointerdown="onPointerDown" @pointermove="onPointerMove" ref="net" />
    <svg width="0" height="0">
      <defs>
        <marker id="m-end" markerWidth="10" markerHeight="10" refX="12" refY="2" orient="auto" markerUnits="strokeWidth" >
          <path d="M0,0 L0,4 L8,2 z"></path>
        </marker>
      </defs>
    </svg>
    <div class="card-actions">
      <div class="flex">
        <ha-button @click="refresh">Refresh</ha-button>
        <div class="time">{{ state }}</div>
      </div>
    </div>
  </ha-card>
</template>

<script>
import { h } from 'vue'
import D3Network from 'vue3-d3-network'

const VStyle = {
  render () { return h('style', this.$slots.default()) }
}

export default {
  components: {
    D3Network,
    VStyle
  },
  props: {
    hass: {
      type: Object,
      default: null
    },
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      initialized: false,
      selectedNodeId: null,
      nodes: [],
      links: [],
      state: '',
      _mouseMoved: false
    }
  },
  computed: {
    options () {
      const config = this.config
      return {
        size: { h: (config && config.height) || 400 },
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
    hass: {
      // immediate: true is critical. Without it the watcher won't fire when
      // defineCustomElement re-creates the Vue app on DOM reconnection (e.g. tab switch)
      immediate: true,
      handler (newHass, oldHass) {
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
          if (JSON.stringify(newAttr) !== JSON.stringify(oldAttr)) {
            this.update()
          }
        }
      }
    }
  },
  methods: {
    node_cb (node) {
      node._svgAttrs = { 'data-id': node.id }
      return node
    },
    link_cb (link) {
      link._svgAttrs = { 'data-id': link.id, 'marker-end': 'url(#m-end)' }
      return link
    },
    onNodeClick (event, node) {
      if (this._mouseMoved) return
      this.selectedNodeId = this.selectedNodeId === node.id ? null : node.id
      this.applyHighlight()
    },
    onSvgClick (event) {
      if (!event.target.closest('.node') && !event.target.closest('.link')) {
        this.selectedNodeId = null
        this.applyHighlight()
      }
    },
    onPointerDown (event) {
      // Track pointer movement to distinguish drag from click. d3-network's
      // mousedown.preventDefault doesn't reliably suppress click after drag
      this._mouseMoved = false
      this._pointerStartX = event.clientX
      this._pointerStartY = event.clientY
    },
    onPointerMove (event) {
      if (this._mouseMoved) return
      if (event.pointerType === 'touch' || event.buttons > 0) {
        const dx = event.clientX - this._pointerStartX
        const dy = event.clientY - this._pointerStartY
        // 5px threshold: sub-pixel jitter still registers as click
        if (dx * dx + dy * dy > 25) this._mouseMoved = true
      }
    },
    applyHighlight () {
      const svg = this.$refs.net?.$el?.querySelector('svg')
      if (!svg) return

      if (this.selectedNodeId) {
        const connectedNodes = new Set()
        const connectedLinks = new Set()
        // include selected node itself in case it has no links; otherwise it would dim too
        connectedNodes.add(this.selectedNodeId)
        this.links.forEach(link => {
          if (link.sid === this.selectedNodeId || link.tid === this.selectedNodeId) {
            connectedNodes.add(link.sid)
            connectedNodes.add(link.tid)
            connectedLinks.add(link.id)
          }
        })
        svg.querySelectorAll('.node').forEach(el => {
          el.classList.toggle('dimmed', !connectedNodes.has(el.getAttribute('data-id')))
        })
        svg.querySelectorAll('.link').forEach(el => {
          el.classList.toggle('dimmed', !connectedLinks.has(el.getAttribute('data-id')))
        })
        // labels don't support _svgAttrs, rely on v-for DOM order matching this.nodes/this.links
        svg.querySelectorAll('.node-label').forEach((label, i) => {
          label.classList.toggle('dimmed', !connectedNodes.has(this.nodes[i]?.id))
        })
        svg.querySelectorAll('.link-label').forEach((label, i) => {
          label.classList.toggle('dimmed', !connectedLinks.has(this.links[i]?.id))
        })
      } else {
        svg.querySelectorAll('.node,.link,.node-label,.link-label').forEach(el => el.classList.remove('dimmed'))
      }
    },
    // Merge new data into existing items, preserving object references so that
    // d3-force node positions (x, y, fx, fy) survive across data refreshes
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
          // existing item: copy new properties in place, keep reference
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
              // Coordinator has no friendlyName; use ' ' not ''. vue3-d3-network
              // falls back to "node <id>" for empty strings
              name: d.type === 'Coordinator' ? ' ' : d.friendlyName,
              _cssClass: d.type ? d.type.toLowerCase() : ''
            }
          }
        },
        links: {
          // Filter out links whose endpoints are missing from the nodes array.
          // Zigbee2MQTT can return inconsistent data; d3-force crashes on dangling refs.
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
      // First load with no data: auto-trigger a networkmap refresh via MQTT
      if (!attr.nodes && !this.initialized) {
        this.initialized = true
        this.refresh()
        return
      }
      const { nodes, links } = this.transform(attr, this.config)
      this.nodes = this.merge(this.nodes, nodes.source, nodes.map)
      this.links = this.merge(this.links, links.source, links.map)
      if (this.selectedNodeId && !this.nodes.find(n => n.id === this.selectedNodeId)) {
        // selected node no longer exists after data refresh, clear selection
        this.selectedNodeId = null
      }
      // d3-network re-renders SVG on data change, which wipes dimmed classes.
      // Reapply after DOM update.
      this.$nextTick(() => this.applyHighlight())
    }
  },
  mounted () {
    // Workaround for Firefox: SVG width may not be computed yet at mount time,
    // causing an empty map. Delay onResize to let layout settle.
    setTimeout(() => {
      this.$refs.net.onResize()
    }, 100)
  }
}
</script>
