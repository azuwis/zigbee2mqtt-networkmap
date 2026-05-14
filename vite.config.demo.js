import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { readFileSync, writeFileSync, rmSync } from 'fs'

function inlineAssets () {
  let outDir
  return {
    name: 'inline-assets',
    configResolved (config) {
      outDir = config.build.outDir
    },
    closeBundle () {
      const htmlPath = resolve(outDir, 'index.html')
      let html = readFileSync(htmlPath, 'utf-8')
      html = html.replace(/<script\b[^>]*src="([^"]*)"[^>]*><\/script>/g, (_, src) => {
        const code = readFileSync(outDir + src, 'utf-8')
        // Fix the import path from the inlined bundle to the card output in dist/
        return `<script type="module">${code.replace(/(["'])(?:\.\.\/)+.*?zigbee2mqtt-networkmap\.js\1/g, '"./zigbee2mqtt-networkmap.js"')}</script>`
      })
      writeFileSync(htmlPath, html)
      rmSync(resolve(outDir, 'assets'), { recursive: true, force: true })
    }
  }
}

export default defineConfig({
  plugins: [vue(), inlineAssets()],
  resolve: {
    // Use runtime-only Vue build to avoid bundling the template compiler (~90K)
    alias: { vue: 'vue/dist/vue.runtime.esm-bundler.js' }
  },
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
      external: (id) => id.endsWith('/src/zigbee2mqtt-networkmap.js')
    },
    minify: 'esbuild',
    target: 'es2020',
    modulePreload: false,
    sourcemap: false,
    cssCodeSplit: false,
    outDir: 'dist',
    emptyOutDir: false
  }
})
