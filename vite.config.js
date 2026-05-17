import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ command }) => {
  if (command === 'build') {
    return {
      plugins: [vue()],
      resolve: {
        // Use runtime-only Vue build to avoid bundling the template compiler (~90K)
        alias: { vue: 'vue/dist/vue.runtime.esm-bundler.js' }
      },
      build: {
        rollupOptions: {
          input: resolve(__dirname, 'src/zigbee2mqtt-networkmap.js'),
          output: {
            entryFileNames: 'zigbee2mqtt-networkmap.js',
            codeSplitting: false
          }
        },
        modulePreload: false,
        sourcemap: false,
        cssCodeSplit: false,
        outDir: 'dist',
        emptyOutDir: true
      }
    }
  }

  return {
    plugins: [vue()],
    server: { port: 5173 }
  }
})
