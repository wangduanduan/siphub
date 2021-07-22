const dgram = require('dgram')
const { onMessage } = require('./on-message')
const log = require('./util').getLogger()
const { initPool } = require('./mysql')

function createUDPServer (port) {
  initPool(2)
  const server = dgram.createSocket('udp4')
  server.on('error', (err) => {
    log.error(`server error:\n${err.stack}`)
    server.close()
  })

  server.on('message', onMessage)

  server.on('listening', () => {
    const address = server.address()
    log.info(`hep server listening ${address.address}:${address.port}`)
  })
  server.bind(port)
  return server
}

module.exports = {
  createUDPServer
}
