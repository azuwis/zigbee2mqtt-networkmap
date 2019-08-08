<template>
    <div>
        <mwc-button @click="refresh">Refresh</mwc-button>
        <d3-network :net-nodes="nodes" :net-links="links" :options="options" :link-cb="link_cb" />
        <svg width="0" height="0">
            <defs>
                <marker id="m-end" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth" >
                    <path d="M0,0 L0,6 L9,3 z"></path>
                </marker>
            </defs>
        </svg>
    </div>
</template>

<script>
 import D3Network from 'vue-d3-network'

 export default {
     components: {
         D3Network
     },
     props: ['hass'],
     data() {
         return {
             initialized: false,
             config: {},
             nodes: [],
             links: [],
         }
     },
     computed: {
         options() {
             const config = this.config
             return {
                 fontSize: config.font_size || 12,
                 force: config.force || 3000,
                 linkLabels: true,
                 linkWidth: config.link_width || 2,
                 nodeLabels: true,
                 nodeSize: config.node_size || 16,
                 size: Object.assign({h: 400}, config.size)
             }
         }
     },
     watch: {
         hass(new_hass, old_hass) {
             const entity = this.config.entity
             if (new_hass && entity) {
                 const new_attr = new_hass.states[entity].attributes
                 var old_attr = null
                 if (old_hass) {
                     old_attr = old_hass.states[entity].attributes
                 }
                 if (!isEqual(new_attr, old_attr)) {
                     this.update()
                 }
             }
         }
     },
     methods: {
         link_cb(link) {
             link._svgAttrs = { 'marker-end': 'url(#m-end)' }
             return link
         },
         merge(target, source, tkey, skey, map) {
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
         refresh() {
             this.hass.callService('mqtt', 'publish', {
                 topic: 'zigbee2mqtt/bridge/networkmap',
                 payload: 'raw'
             })
         },
         update() {
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
