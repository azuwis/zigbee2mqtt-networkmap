# zigbee2mqtt-networkmap

[Custom Card](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card) for [Home Assistant](https://www.home-assistant.io/) to show the [Zigbee2mqtt](https://github.com/Koenkk/zigbee2mqtt/) network map with [vue-d3-network](https://github.com/emiliorizzo/vue-d3-network/).

## [Demo](https://azuwis.github.io/zigbee2mqtt-networkmap/)

[![Screenshot](https://azuwis.github.io/zigbee2mqtt-networkmap/screenshot.gif)](https://azuwis.github.io/zigbee2mqtt-networkmap/)

## Home Assistant setup

Update Zigbee2mqtt to version 1.17.0 or later, earlier version may not work.

This instruction is for Home Assistant 0.107 and later.

For 0.106 and earlier instruction can be found [here](https://github.com/azuwis/zigbee2mqtt-networkmap/tree/e6ea1b5fcf680372446ad11e968f429f8f8c1c18).

### Backend setup

In `configuration.yaml` of the Home Assistant installation:
``` yaml
mqtt:
  sensor:
    - name: Zigbee2mqtt Networkmap
      # if you change base_topic of Zigbee2mqtt, change state_topic accordingly
      state_topic: zigbee2mqtt/bridge/response/networkmap
      value_template: >-
        {{ now().strftime('%Y-%m-%d %H:%M:%S') }}
      # again, if you change base_topic of Zigbee2mqtt, change json_attributes_topic accordingly
      json_attributes_topic: zigbee2mqtt/bridge/response/networkmap
      json_attributes_template: "{{ value_json.data.value | tojson }}"
```

### Frontend setup (HACS)

When installing the plugin via [HACS](https://hacs.xyz/), you'll need to add the resource manually.

 - Edit your profile (bottom iten in the left menu in the web UI). Enable *Advanced Mode*.
 - Go to *Settings* -> *Dashboards* and click the three dots in the upper right corner.
 - Click *Resources*
 - Click *ADD RESOURCE* in the bottom right
 - Enter `/hacsfiles/zigbee2mqtt-networkmap/zigbee2mqtt-networkmap.js` in the URL field  and select *JavaScript Module*. Click *CREATE*.
 - Go to *HACS* -> *Frontend*. Here you should see the *Zigbee2mqtt networkmap Card* without any error messages.

### Card setup (Dashboard Web UI)

In order to add this card to the dashboard, Use the *Edit Dashboard* on the top right , three-dots menu, add a manual card, and use this configuration:
```
type: custom:zigbee2mqtt-networkmap
entity: sensor.zigbee2mqtt_networkmap
```
Make sure to use the same name of the sensor defined under `configuration.yaml`, baseed on the `Zigbee2mqtt Networkmap` name.

### Frontend setup (YAML mode)

Download [`zigbee2mqtt-networkmap.js`](https://github.com/azuwis/zigbee2mqtt-networkmap/releases/download/v0.9.0/zigbee2mqtt-networkmap.js) and put it into `<config-directory>/www/` directory.

Enable [Dashboard YAML mode](https://www.home-assistant.io/dashboards/dashboards/#using-yaml-for-the-default-dashboard).

In `configuration.yaml`:

``` yaml
lovelace:
  mode: yaml
  resources:
    - url: /local/zigbee2mqtt-networkmap.js?v=0.9.0
      type: module

```

### Card setup (YAML mode)

In `ui-lovelace.yaml`:

``` yaml
views:
  - title: Zigbee Network
    panel: true # this renders the first card on full width, other cards in this view will not be rendered
    cards:
      - type: custom:zigbee2mqtt-networkmap
        entity: sensor.zigbee2mqtt_networkmap
        # the following are optional:
        mqtt_base_topic: zigbee2mqtt # if you change base_topic of Zigbee2mqtt, change it accordingly
        mqtt_topic: zigbee2mqtt/bridge/request/networkmap # or you can specify the full mqtt topic, see https://www.zigbee2mqtt.io/guide/usage/mqtt_topics_and_messages.html#zigbee2mqtt-bridge-request
        mqtt_payload: { type: 'raw', routes: true }
        force: 3000 # decrease it to get smaller map if you have many devices
        node_size: 16
        font_size: 12
        link_width: 2
        height: 400 # height of the card
        # use this css config or use whatever css tech to change look and feel,
        # the same variable can also be used in Home Assistant themes, see https://www.home-assistant.io/components/frontend/#defining-themes
        css: |
          :host {
            --zigbee2mqtt-networkmap-node-color: rgba(18, 120, 98, .7);
            --zigbee2mqtt-networkmap-node-fill-color: #dcfaf3;
            --zigbee2mqtt-networkmap-node-pinned-color: rgba(190, 56, 93, .6);
            --zigbee2mqtt-networkmap-link-color: rgba(18, 120, 98, .5);
            --zigbee2mqtt-networkmap-hover-color: #be385d;
            --zigbee2mqtt-networkmap-link-selected-color: rgba(202, 164, 85, .6);
            --zigbee2mqtt-networkmap-label-color: #127862;
            --zigbee2mqtt-networkmap-arrow-color: rgba(18, 120, 98, 0.7);
            --zigbee2mqtt-networkmap-node-coordinator-color: rgba(224, 78, 93, .7);
            --zigbee2mqtt-networkmap-node-router-color: rgba(0, 165, 255, .7);
          }
```

### Upgrade (YAML mode)

Replace `<config-directory>/www/zigbee2mqtt-networkmap.js` with new one, and
change version string in `configuration.yaml`:

``` yaml
resources:
  - url: /local/zigbee2mqtt-networkmap.js?v=0.9.0 # change `v=x.x.x` to `v=0.9.0`
    type: module
```

And then refresh the browser.

## FAQ

Q: How can I customize device names in the map?

A: The names showed in the map are given by Zigbee2mqtt, you need to configure
Zigbee2mqtt to customize them, see
https://www.zigbee2mqtt.io/guide/configuration/devices-groups.html#common-device-options for the
`friendly_name` option.

Additionaly, HomeAssistant will automatically use the same names when MQTT auto
discovery is enabled, see
https://www.zigbee2mqtt.io/guide/usage/integrations/home_assistant.html#mqtt-discovery

Q: Some of my devices are detached.

A: This is probably a Zigbee2mqtt issue, see
https://github.com/Koenkk/zigbee2mqtt/issues/2436 for discussion.

## Changelog

#### [0.9.0] - 2024-02-29

* Fix link label text position and node text background #53
* Add Github actions to build and release

#### [0.8.0] - 2023-05-29

* Allow config mqtt full topic and payload, see [Backend setup](#backend-setup) and [Issue #45](https://github.com/azuwis/zigbee2mqtt-networkmap/issues/45)

#### [0.7.0] - 2021-08-18

* Update for new zigbee2mqtt API added in 1.17.0, thank @marcins

#### [0.6.0] - 2019-12-02

* Fixed TypeError if device type is not available, thank @ChrisScheffler
* Support [HACS](https://hacs.xyz/)

#### [0.5.0] - 2019-08-27

* Recalculate width/height on window resize
* Make the arrows sharper
* Use css variables to allow theming
* Allow config extra css styles

#### [0.4.0] - 2019-08-23

* Workaround empty map problem in Firefox.

#### [0.3.0] - 2019-08-22

* Filter all dead links.

#### [0.2.0] - 2019-08-22

* Filter links with address 0x0000000000000000.

#### [0.1.0] - 2019-08-15

* Initial release.

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

And open the demo at http://localhost:8080/ using web browser.

Or use Home Assistant for development, in `configuration.yaml`:

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
