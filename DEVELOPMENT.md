# Development Guide

## Project

A Home Assistant custom card that renders a Zigbee2MQTT network map as an interactive force-directed graph. Distributed as a single JS file (`zigbee2mqtt-networkmap.js`) loaded as a module resource in Home Assistant's dashboard.

## Commands

```bash
yarn serve    # Dev server with HMR at http://localhost:8080 (mock HA state, no real HA needed)
yarn build    # Production build: card bundle + demo page -> dist/
yarn lint     # ESLint 10 flat config (eslint.config.js) with auto-fix (plugin:vue/vue3-essential + @vue/standard)
```

## Architecture

**Vue 3 + `defineCustomElement`** — the Vue component is wrapped as a native custom element (`<zigbee2mqtt-networkmap>`) using Vue 3's built-in `defineCustomElement` API (no third-party wrapper needed). `hass` and `config` are declared as props, giving the custom element automatic property accessors for Home Assistant's state updates.

**Entry point:** `src/zigbee2mqtt-networkmap.js` — calls `defineCustomElement()` on the Vue component, extends the resulting class with a `setConfig()` method that sets `this.config` (which triggers the prop setter → Vue watcher), then calls `customElements.define()`.

**Main component:** `src/components/Zigbee2mqttNetworkmap.vue` — the entire card logic in one file:
- Uses Vue 3 fragments (multiple root elements): `<v-style>` before `<ha-card>`
- `<v-style>` is a local component that uses `h('style', this.$slots.default())` to render CSS into a `<style>` tag. Placed outside `<ha-card>` to avoid being slotted into `<ha-card>`'s own Shadow DOM — this ensures styles apply correctly within `defineCustomElement`'s shadow root
- CSS is written inline in the template between `<v-style>` tags, with `{{ css }}` interpolation for user-provided CSS from `config.css`
- Renders `<d3-network>` from `vue3-d3-network` for the force-directed graph
- `node_cb(node)` / `link_cb(link)`: stamp `_svgAttrs` with `data-id` on each SVG element so `applyHighlight()` can query them
- `hass` and `config` are declared as **props** (not data) — `defineCustomElement` automatically creates property accessors so that Home Assistant's `element.hass = ...` and `element.setConfig(...)` trigger Vue reactivity
- `hass` watcher (immediate: true): fires on component creation and HA state changes, calls `transform()` + `merge()` to update nodes/links while preserving existing positions. `immediate: true` is critical — without it the watcher won't fire when `defineCustomElement` re-creates the Vue app on DOM reconnection (e.g. tab switch)
- `refresh()`: publishes an MQTT message (`zigbee2mqtt/bridge/request/networkmap`) to request a fresh network map. On first load with no cached data (`initialized` flag), `update()` auto-calls `refresh()`. ⚠ `initialized` resets to `false` when defineCustomElement recreates the Vue app (e.g. tab switch), so it re-publishes MQTT on every reconnect.
- `transform(attr, config)`: converts raw HA sensor attributes into node/link arrays. Coordinator nodes get `name: ' '` (a space, not empty — vue3-d3-network falls back to `"node <id>"` for empty strings). Links with dangling endpoints (nodes missing from the nodes array) are filtered out to prevent d3-force errors
- `merge(target, source, map)`: merges new data into existing nodes/links, preserving object references so d3-force positions (x, y, fx, fy) survive across data refreshes. Uses `JSON.stringify` for deep comparison in the watcher
- **Node selection / highlight:** clicking a node toggles it in `selectedNodeIds` (a Set, supporting multi-select); `applyHighlight()` queries SVG DOM for `.node` / `.link` / `.node-label` / `.link-label` elements and toggles a `dimmed` class (opacity 0.15) on elements not connected to any selected node. Node/link matching uses `data-id` attributes stamped via `_svgAttrs`; label matching falls back to `v-for` DOM order (⚠ fragile: assumes d3-network renders labels in the same order as `this.nodes`/`this.links` — if rendering order diverges, dimming applies to wrong labels). Clicking the SVG background clears all selections. After data refresh, `$nextTick(() => applyHighlight())` reapplies dimming because d3-network re-renders SVG and wipes the classes
- **Drag vs click distinction:** d3-network's `mousedown.preventDefault` doesn't reliably suppress `click` after a drag, so `onPointerDown` / `onPointerMove` track pointer movement. A 5px threshold (`dx² + dy² > 25`) sets `_mouseMoved`; `onNodeClick` bails early when set
- `mounted()`: calls `$refs.net.onResize()` in a 100ms `setTimeout` — workaround for Firefox where SVG width may not be computed at mount time
- Config options: `entity`, `mqtt_base_topic`, `mqtt_topic`, `mqtt_payload`, `force`, `node_size`, `font_size`, `link_width`, `height`, `css`

**Dev-only files (not bundled in the card):**
- `src/main.js` — mock HA environment with fake states and a toggle between two network snapshots; loaded by `index.html` in both dev and production demo
- `src/ha-card.js` — standalone LitElement replica of `<ha-card>` needed because the real HA component isn't available during dev
- `src/ha-button.js` — standalone LitElement replica of `<ha-button>` for the same reason

**Build output:** Two-stage build via `vite.config.js`:
1. `vite build` — card bundle → `dist/zigbee2mqtt-networkmap.js` (~156K, self-contained: Vue, d3-force, vue3-d3-network). Uses `resolve.alias` to force Vue runtime-only build (avoids ~90K template compiler).
2. `vite build --config vite.config.demo.js` — demo page → `dist/index.html`, externalizes the card import, inlines the demo JS.

No source maps in production. `modulePreload: false`, `codeSplitting: false`.

**CI:** GitHub Actions with Nix (`default.nix`) for reproducible builds. On tags, the artifact is uploaded and deployed to GitHub Pages.

**Data flow:**
```
Zigbee2MQTT MQTT -> HA sensor attributes { nodes: [...], links: [...] }
  -> transform() -> { nodes: [{id, name, _cssClass}], links: [{id, sid, tid, name}] }
    -> merge() preserves existing node/link positions
      -> <d3-network> (vue3-d3-network) renders SVG force-directed graph
```
