const { createWebServer } = require('./web-server')
const { createUDPServer } = require('./hep-server')

createWebServer(3000)
createUDPServer(9060)
