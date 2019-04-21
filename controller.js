// controller.js
const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://192.168.0.119:1883')

var sensorState = {}
var connected = false
var fanState = {}

client.on('connect', () => {
  client.subscribe('zigbee2mqtt/0x00158d0002452109')
  client.subscribe('zigbee2mqtt/bridge/state')
  client.subscribe('zigbee2mqtt/0x00124b001b7f00f6')
})

client.on('message', (topic, message) => {
  switch (topic) {
    case 'zigbee2mqtt/bridge/state':
      return handleCoordinatorConnected(message)
    case 'zigbee2mqtt/0x00158d0002452109':
      return handleSensor(message)
      case 'zigbee2mqtt/0x00124b001b7f00f6':
      return handleFan(message)
  }
  console.log('No handler for topic %s', topic)
})

function handleCoordinatorConnected (message) {
  console.log('ZNP connected status %s', message)
  connected = (message.toString() == 'online')
}

function handleSensor (message) {
  sensorState = JSON.parse(message)
  console.log('sensor state update to %s', message)
  processSensorScenario()
}

function handleFan (message) {
  fanState = JSON.parse(message)
  console.log('Fan state is %s', message)
}

function processSensorScenario() {
  console.log('cuurent humidity: ', sensorState.humidity)
  switch (true) {
    case sensorState.humidity > 70:
      return handleFanOn()
    case sensorState.humidity < 55:
      return handleFanOff()
  }
  }

  function handleFanOn() {
    if (connected && fanState.state == 'OFF') {
      console.log('Fan is ON')
      fanState.state = 'ON'
      client.publish('zigbee2mqtt/0x00124b001b7f00f6/set', 'ON')
      autoOff()
    }
  }

  function handleFanOff() {
    if (connected && fanState.state == 'ON') {
      console.log('Fan is OFF')
      fanState.state = 'OFF'
      client.publish('zigbee2mqtt/0x00124b001b7f00f6/set', 'OFF')
    }
  }

// --- For Demo Purposes Only ----//

function autoOn()
{
  setTimeout(() => {
    console.log('fan is on')
    handleFanOn()
  }, 5000)
}

function autoOff()
{
  setTimeout(() => {
    console.log('fan is off')
    handleFanOff()
  }, 3600000)
}
