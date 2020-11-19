const config = require('config')
const log4js = require('log4js')
const logger = log4js.getLogger()

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
