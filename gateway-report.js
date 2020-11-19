const { getLogger } = require('./util')
const log = getLogger()

let gateway = ''
let enableRepot = false
const report = {

}

function updateGateway (ip, status) {
  if (gateway.includes(ip)) {

  }
}

function initGateways (ips) {
  if (typeof ips !== 'string') {
    return log.error('gateway ips is not string')
  }

  gateway = ips

  enableRepot = true
}
