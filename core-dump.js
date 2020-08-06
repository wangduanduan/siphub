const { writeHeapSnapshot } = require('v8')
const { getLogger } = require('./util')

const logger = getLogger()

function coreDump () {
  logger.error(`start core dump`)
  let fileName = writeHeapSnapshot()
  logger.error(`core dump done ${fileName}`)
}

module.exports = {
  coreDump
}
