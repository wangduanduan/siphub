const axios = require('axios')
const config = require('config')
const logger = require('./util').getLogger()

const { getStat, resetStat } = require('./statis')

const maxFailed = 1
let currentFailed = 0
let timeId = 0

if (config.get('influxdb')) {
  logger.info('start monitor', config.get('influxdb'))
  startMonitor()
}

function makeupPoint (measurement, tags, fields) {
  let _tags = qs(tags, ',')
  let _fields = qs(fields, ',')
  let msg = `${measurement},${_tags} ${_fields}`
  logger.info(msg)
  return Buffer.from(msg)
}

function writePoint (measurement, tags, fields) {
  return axios({
    url: config.get('influxdb'),
    method: 'post',
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    timeout: 3000,
    data: makeupPoint(measurement, tags, fields)
  })
}

function qs (param, flag = '&') {
  let values = []
  Object.keys(param).forEach(key => {
    values.push(`${key}=${param[key]}`)
  })
  return values.join(flag)
}

function monitor () {
  writePoint('siphub', { name: 'siphub' }, {
    ...process.memoryUsage(),
    ...getStat()
  })
    .then((res) => {
      logger.info('write influxdb success')
      resetStat()
    })
    .catch((err) => {
      currentFailed++
      logger.error('write influxdb failed')
      if (err.response) {
        logger.error(err.response.status, err.response.data)
      }
      if (currentFailed > maxFailed) {
        logger.error('current failed reach limit, no longer write influxdb')
        clearInterval(timeId)
      }
    })
}

function startMonitor () {
  timeId = setInterval(monitor, 1000 * parseInt(config.get('influxdbSecond')))
}

// curl -i -XPOST "http://192.168.40.149:32021/write?db=poc&rp=poc" --data-binary "mylog,name=wdd error_count=203,no_send=0"
