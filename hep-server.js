const dgram = require('dgram')
const server = dgram.createSocket('udp4')
const { onMessage } = require('./on-message')
const log = require('./util').getLogger()

server.on('error', (err) => {
  log.error(`server error:\n${err.stack}`)
  server.close()
})

server.on('message', onMessage)

server.on('listening', () => {
  const address = server.address()
  log.info(`hep server listening ${address.address}:${address.port}`)
})

module.exports = server
