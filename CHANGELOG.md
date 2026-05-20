# Changelog

#### [0.12.0] - 2026-05-19

* Fix map disappearing after tab switch due to Vue 3 watcher not firing on remount
* Fix height config via options prop instead of direct ref mutation

#### [0.11.0] - 2026-05-18

* Migrate from Vue 2 to Vue 3
* Migrate from Vue CLI to Vite
* Support new zigbee2mqtt networkmap links data schema

#### [0.10.0] - 2025-01-11

* Prevent undefined exception #78
* Use Github actions to deploy github-pages

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
