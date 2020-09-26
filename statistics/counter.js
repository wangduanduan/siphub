const log = require('../util').getLogger()
const dayjs = require('dayjs')
const peekSecond = 10

const statAll = {
  hep_receive_all: 0, // 累计收到的hep消息
  hep_drop_all: 0, // 累计丢弃的hep消息
  db_insert_all: 0 // 累计数据库插入的消息
}

const peekStat = {}

function getPeekStat () {
  return peekStat
}

function peek () {
  log.info('start peek')
  
  Object.keys(statAll).forEach((key) => {
    peekOne(key)
  })

  log.info(peekStat)
}

setInterval(peek, peekSecond * 1000)

function peekOne (key) {
  if (typeof peekStat[`${key}_last`] === 'undefined') {
    peekStat[`${key}_last`] = 0
    peekStat[`${key}_max`] = 0
    peekStat[`${key}_min`] = 0
    peekStat[`${key}_max_time`] = ''
    peekStat[`${key}_min_time`] = ''
  }

  var dis = (statAll[key] - peekStat[`${key}_last`]) / peekSecond

  if (dis > peekStat[`${key}_max`]) {
    peekStat[`${key}_max`] = dis
    peekStat[`${key}_max_time`] = dayjs().format('YYYY-MM-DD HH:mm:ss')
  }

  if (dis < peekStat[`${key}_min`]) {
    peekStat[`${key}_min`] = dis
    peekStat[`${key}_min_time`] = dayjs().format('YYYY-MM-DD HH:mm:ss')
  }

  peekStat[`${key}_last`] = statAll[key]
}

function getStat () {
  return statAll
}

function update (key) {
  if (typeof statAll[key] === 'undefined') {
    log.error(`key: ${key} not exit on statistics`)
    return
  }

  if (statAll[key] >= Number.MAX_SAFE_INTEGER) {
    statAll[key] = 0
  }

  statAll[key]++
}

module.exports = {
  getStat,
  getPeekStat,
  update
}
