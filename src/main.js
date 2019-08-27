import '@material/mwc-button'
import './ha-card'
customElements.whenDefined('zigbee2mqtt-networkmap').then(() => {
  function createHass () {
    function pad (str) {
      return String('00' + str).slice(-2)
    }

    function format (d) {
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    }

    const attrs = [
      {
        'links': [
          {
            'lqi': 17,
            'sourceIeeeAddr': '04',
            'targetIeeeAddr': '01'
          },
          {
            'lqi': 69,
            'sourceIeeeAddr': '05',
            'targetIeeeAddr': '01'
          },
          {
            'lqi': 13,
            'sourceIeeeAddr': '06',
            'targetIeeeAddr': '01'
          },
          {
            'lqi': 35,
            'sourceIeeeAddr': '07',
            'targetIeeeAddr': '01'
          },
          {
            'lqi': 41,
            'sourceIeeeAddr': '01',
            'targetIeeeAddr': '07'
          },
          {
            'lqi': 26,
            'sourceIeeeAddr': '03',
            'targetIeeeAddr': '01'
          },
          {
            'lqi': 47,
            'sourceIeeeAddr': '02',
            'targetIeeeAddr': '01'
          },
          {
            'lqi': 32,
            'sourceIeeeAddr': '09',
            'targetIeeeAddr': '01'
          },
          {
            'lqi': 70,
            'sourceIeeeAddr': '10',
            'targetIeeeAddr': '01'
          }
        ],
        'nodes': [
          {
            'friendlyName': '01',
            'ieeeAddr': '01',
            'type': 'Coordinator'
          },
          {
            'friendlyName': 'cube',
            'ieeeAddr': '02',
            'type': 'EndDevice'
          },
          {
            'friendlyName': 'temperature',
            'ieeeAddr': '03',
            'type': 'EndDevice'
          },
          {
            'friendlyName': 'button',
            'ieeeAddr': '04',
            'type': 'EndDevice'
          },
          {
            'friendlyName': 'motion',
            'ieeeAddr': '05',
            'type': 'EndDevice'
          },
          {
            'friendlyName': 'huminity',
            'ieeeAddr': '06',
            'type': 'EndDevice'
          },
          {
            'friendlyName': 'plug',
            'ieeeAddr': '07',
            'type': 'Router'
          },
          {
            'friendlyName': 'door',
            'ieeeAddr': '09',
            'type': 'EndDevice'
          },
          {
            'friendlyName': 'smoke',
            'ieeeAddr': '10',
            'type': 'EndDevice'
          }
        ]
      },
      {
        'links': [
          {
            'lqi': 17,
            'sourceIeeeAddr': '04',
            'targetIeeeAddr': '01'
          },
          {
            'lqi': 69,
            'sourceIeeeAddr': '05',
            'targetIeeeAddr': '01'
          },
          {
            'lqi': 13,
            'sourceIeeeAddr': '06',
            'targetIeeeAddr': '01'
          },
          {
            'lqi': 35,
            'sourceIeeeAddr': '07',
            'targetIeeeAddr': '01'
          },
          {
            'lqi': 41,
            'sourceIeeeAddr': '01',
            'targetIeeeAddr': '07'
          },
          {
            'lqi': 47,
            'sourceIeeeAddr': '02',
            'targetIeeeAddr': '07'
          },
          {
            'lqi': 32,
            'sourceIeeeAddr': '09',
            'targetIeeeAddr': '01'
          },
          {
            'lqi': 70,
            'sourceIeeeAddr': '10',
            'targetIeeeAddr': '01'
          }
        ],
        'nodes': [
          {
            'friendlyName': '01',
            'ieeeAddr': '01',
            'type': 'Coordinator'
          },
          {
            'friendlyName': 'cube',
            'ieeeAddr': '02',
            'type': 'EndDevice'
          },
          {
            'friendlyName': 'button',
            'ieeeAddr': '04',
            'type': 'EndDevice'
          },
          {
            'friendlyName': 'motion',
            'ieeeAddr': '05',
            'type': 'EndDevice'
          },
          {
            'friendlyName': 'huminity',
            'ieeeAddr': '06',
            'type': 'EndDevice'
          },
          {
            'friendlyName': 'plug',
            'ieeeAddr': '07',
            'type': 'Router'
          },
          {
            'friendlyName': 'door',
            'ieeeAddr': '09',
            'type': 'EndDevice'
          },
          {
            'friendlyName': 'smoke',
            'ieeeAddr': '10',
            'type': 'EndDevice'
          }
        ]
      }
    ]

    const hass = {
      count: 0,
      callService () {
        this.count++
        document.querySelector('zigbee2mqtt-networkmap').hass = Object.assign({}, hass, {
          count: this.count,
          states: {
            'sensor.zigbee2mqtt_networkmap': {
              state: format(new Date()),
              attributes: attrs[this.count % 2]
            }
          }
        })
      },
      states: {
        'sensor.zigbee2mqtt_networkmap': {
          state: format(new Date()),
          attributes: attrs[0]
        }
      }
    }
    return hass
  }

  const net = document.querySelector('zigbee2mqtt-networkmap')
  net.setConfig({
    type: 'custom:zigbee2mqtt-networkmap',
    entity: 'sensor.zigbee2mqtt_networkmap',
    mqtt_base_topic: 'zigbee2mqtt',
    force: 3000,
    node_size: 16,
    font_size: 12,
    link_width: 2,
    height: 400,
    css: `
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
`
  })
  net.hass = createHass()
})
