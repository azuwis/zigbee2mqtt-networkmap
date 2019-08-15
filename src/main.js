import '@material/mwc-button'
import './ha-card'
import(/* webpackChunkName: 'zigbee2mqtt-networkmap' */ './zigbee2mqtt-networkmap').then(() => {
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
    entity: 'sensor.zigbee2mqtt_networkmap'
  })
  net.hass = createHass()
})
