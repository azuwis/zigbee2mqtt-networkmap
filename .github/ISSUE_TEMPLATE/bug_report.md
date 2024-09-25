---
name: Bug report
about: Create a report to help us improve
title: ''
labels: ''
assignees: ''

---

**Describe the bug**
A clear and concise description of what the bug is.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Home Assistant version**
On Home Assistant, go to `Menu` -> `Settings` -> `About`

**Zigbee2mqtt version**
Check `zigbee2mqtt/package.json` file, e.g. `"version": "1.5.1"`. Please update
Zigbee2mqtt to version 1.5.1 or later and try again if not already done.

**OS and browser version**
 e.g. Debian 10 Firefox 68, Windows 10 Chrome 76

**Error message on browser**
On Google Chrome, open browser `Menu` -> `More tools` -> `Developer tools` -> `Console`,
```
and copy error message here if any.
```

**State attributes of `sensor.zigbee2mqtt_networkmap`**
On Home Assistant, go to `Menu` -> `Developer tools` -> `STATES` ->
`sensor.zigbee2mqtt_networkmap` -> Click the link and scroll up, find `State
attributes (JSON, optional)`,
```
and copy the text here, screenshot won't help.
```

**Home Assistant log**
Check `<config-directory>/home-assistant.log`,
```
and copy related log here.
```

**Additional context**
Add any other context about the problem here.
