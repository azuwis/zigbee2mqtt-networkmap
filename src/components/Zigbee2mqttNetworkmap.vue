<template>
    <div v-if="hass && config.entity">{{ config.entity }} is {{ hass.states[config.entity].state }}</div>
</template>

<script>
 export default {
     props: ['hass'],
     data: function() {
         return {
             config: {}
         }
     }
 }
</script>
