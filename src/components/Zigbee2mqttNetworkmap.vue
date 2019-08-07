<template>
    <div>
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
             config: {},
             options: {
                 fontSize: 12,
                 force: 3000,
                 linkLabels: true,
                 linkWidth: 2,
                 nodeLabels: true,
                 nodeSize: 12
             }
         }
     },
     computed: {
         nodes() {
             if (this.hass && this.config.entity) {
                 const attr = this.hass.states[this.config.entity].attributes
                 return attr.nodes.map(function(d) {
                     return {
                         id: d.ieeeAddr,
                         name: d.friendlyName,
                         _cssClass: d.type.toLowerCase()
                     }
                 })
             }
             return []
         },
         links() {
             if (this.hass && this.config.entity) {
                 const attr = this.hass.states[this.config.entity].attributes
                 return attr.links.map(function(d) {
                     return {
                         sid: d.sourceIeeeAddr,
                         tid: d.targetIeeeAddr,
                         name: d.lqi
                     }
                 })
             }
             return []
         }
     },
     methods: {
         link_cb(link) {
             link._svgAttrs = { 'marker-end': 'url(#m-end)' }
             return link
         }
     }
 }
</script>

<style>
 canvas{position:absolute;top:0;left:0}.net{height:100%;margin:0}.node{stroke:rgba(18,120,98,.7);stroke-width:3px;-webkit-transition:fill .5s ease;transition:fill .5s ease;fill:#dcfaf3}.node.selected{stroke:#caa455}.node.pinned{stroke:rgba(190,56,93,.6)}.link{stroke:rgba(18,120,98,.3)}.link,.node{stroke-linecap:round}.link:hover,.node:hover{stroke:#be385d;stroke-width:5px}.link.selected{stroke:rgba(202,164,85,.6)}.curve{fill:none}.link-label,.node-label{fill:#127862}.link-label{-webkit-transform:translateY(-.5em);transform:translateY(-.5em);text-anchor:middle}
 #m-end path {
     fill: rgba(18, 120, 98, 0.7);
 }
.node.coordinator {
    stroke: rgba(224, 78, 93, .7);
}
.node.router {
    stroke: rgba(0, 165, 255, .7);
}
</style>
