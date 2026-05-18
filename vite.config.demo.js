import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  plugins: [vue()],
  resolve: {
    // Use runtime-only Vue build to avoid bundling the template compiler (~90K)
    alias: { vue: 'vue/dist/vue.runtime.esm-bundler.js' }
  },
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
      external: (id) => id.endsWith('/src/zigbee2mqtt-networkmap.js'),
      output: {
        paths: (id) => './zigbee2mqtt-networkmap.js'
      }
    },
    modulePreload: false,
    sourcemap: false,
    cssCodeSplit: false,
    outDir: 'dist',
    emptyOutDir: false
  }
})
