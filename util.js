const config = require('config')
// const log4js = require('log4js')
const pino = require('pino')
// const logger = log4js.getLogger()
// trace 10
// debug 20
// info 30
// warn 40
// error 50
// fatal 60
const logger = pino({
  level: config.get('logLevel')
})

logger.level = config.get('logLevel')

// log4js
// trace
// debug
// info
// warn
// error
// fatal

function getLogger () {
  return logger
}

function reverseString (str) {
  if (!str) {
    return ''
  }

  return str.split('').reverse().join('')
}

module.exports = {
  getLogger,
  reverseString
}
