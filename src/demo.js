function pad (str) {
  return String('00' + str).slice(-2)
}

function format (d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const net = document.querySelector('zigbee2mqtt-networkmap')

const config = {
  type: 'custom:zigbee2mqtt-networkmap',
  entity: 'sensor.zigbee2mqtt_networkmap'
}

const attrs = [
  {
    'links': [
      {
        'lqi': 4,
        'sourceIeeeAddr': '05',
        'targetIeeeAddr': '01'
      },
      {
        'lqi': 31,
        'sourceIeeeAddr': '03',
        'targetIeeeAddr': '01'
      },
      {
        'lqi': 69,
        'sourceIeeeAddr': '06',
        'targetIeeeAddr': '01'
      },
      {
        'lqi': 1,
        'sourceIeeeAddr': '07',
        'targetIeeeAddr': '01'
      },
      {
        'lqi': 35,
        'sourceIeeeAddr': '08',
        'targetIeeeAddr': '01'
      },
      {
        'lqi': 26,
        'sourceIeeeAddr': '04',
        'targetIeeeAddr': '01'
      },
      {
        'lqi': 45,
        'sourceIeeeAddr': '09',
        'targetIeeeAddr': '01'
      },
      {
        'lqi': 47,
        'sourceIeeeAddr': '02',
        'targetIeeeAddr': '01'
      },
      {
        'lqi': 32,
        'sourceIeeeAddr': '10',
        'targetIeeeAddr': '01'
      },
      {
        'lqi': 70,
        'sourceIeeeAddr': '11',
        'targetIeeeAddr': '01'
      },
      {
        'lqi': 38,
        'sourceIeeeAddr': '12',
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
        'friendlyName': 'button_2',
        'ieeeAddr': '03',
        'type': 'EndDevice'
      },
      {
        'friendlyName': 'ht_bedroom',
        'ieeeAddr': '04',
        'type': 'EndDevice'
      },
      {
        'friendlyName': 'button_1',
        'ieeeAddr': '05',
        'type': 'EndDevice'
      },
      {
        'friendlyName': 'motion_living_room',
        'ieeeAddr': '06',
        'type': 'EndDevice'
      },
      {
        'friendlyName': 'ht_climate_bedroom',
        'ieeeAddr': '07',
        'type': 'EndDevice'
      },
      {
        'friendlyName': 'plug',
        'ieeeAddr': '08',
        'type': 'Router'
      },
      {
        'friendlyName': 'motion_dining_room',
        'ieeeAddr': '09',
        'type': 'EndDevice'
      },
      {
        'friendlyName': 'door_bedroom',
        'ieeeAddr': '10',
        'type': 'EndDevice'
      },
      {
        'friendlyName': 'smoke',
        'ieeeAddr': '11',
        'type': 'EndDevice'
      },
      {
        'friendlyName': 'button_3',
        'ieeeAddr': '12',
        'type': 'EndDevice'
      }
    ]
  },

  {
    'links': [],
    'nodes': [
      {
        'friendlyName': '01',
        'ieeeAddr': '01',
        'type': 'Coordinator'
      }
    ]
  }
]

const hass = {
  count: 0,
  callService () {
    this.count++
    net.hass = Object.assign({}, hass, {
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

net.setConfig(config)
net.hass = hass
