# zigbee2mqtt-networkmap

[Lovelace Custom Card](https://developers.home-assistant.io/docs/en/lovelace_custom_card.html) for [Home Assistant](https://www.home-assistant.io/) to show the [Zigbee2mqtt](https://github.com/Koenkk/zigbee2mqtt/) network map with [vue-d3-network](https://github.com/emiliorizzo/vue-d3-network/).

## Home Assistant setup

Download [`zigbee2mqtt-networkmap.js`](https://github.com/azuwis/zigbee2mqtt-networkmap/releases/download/v0.1.0/zigbee2mqtt-networkmap.js) and put it into `<config-directory>/www/` directory.

In `configuration.yaml`:
``` yaml
sensor:
  - platform: mqtt
    name: Zigbee2mqtt Networkmap
    state_topic: zigbee2mqtt/bridge/networkmap/raw
    value_template: >-
      {{ now().strftime('%Y-%m-%d %H:%M:%S') }}
    json_attributes_topic: zigbee2mqtt/bridge/networkmap/raw

```

Enable [Lovelace YAML mode](https://www.home-assistant.io/lovelace/yaml-mode/),
and in `ui-lovelace.yaml`:

``` yaml
resources:
  - url: /local/zigbee2mqtt-networkmap.js?v=0.1.0
    type: module

views:
  - title: Zigbee Network
    cards:
      - type: custom:zigbee2mqtt-networkmap
        entity: sensor.zigbee2mqtt_networkmap
```

Full card default options:

``` yaml
        mqtt_base_topic: zigbee2mqtt
        force: 3000 # decrease it to get smaller map if you have many devices
        node_size: 16
        font_size: 12
        link_width: 2
        height: 400 # height of the card
```

## Development

Install [nodejs](https://nodejs.org/) and [yarn](https://yarnpkg.com/), clone the
repo and install dependances:

``` bash
git clone https://github.com/azuwis/zigbee2mqtt-networkmap.git
cd zigbee2mqtt-networkmap
yarn install
```

### Compiles and hot-reloads for development

``` bash
yarn serve
```

In `ui-lovelace.yaml`:
``` yaml
resources:
  # - url: /local/zigbee2mqtt-networkmap.js
  #   type: module
  - url: http://localhost:8080/zigbee2mqtt-networkmap.js
    type: js

```

### Compiles and minifies for production

``` bash
yarn build
```

### Lints and fixes files

``` bash
yarn lint
```
