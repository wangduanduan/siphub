const express = require('express')
const router = express.Router()
const { getLogger, reverseString } = require('../util')
const { getConnection, createTable } = require('../mysql')
const dayjs = require('dayjs')
const { getStat } = require('../statis')
const { coreDump } = require('../core-dump')

const log = getLogger()

function removeDupItem (arr) {
  let ids = ''

  return arr.filter((item) => {
    if (ids.includes(item.callid)) {
      return false
    }

    ids += item.callid

    return true
  })
}

router.get('/search', function (req, res, next) {
  let connection = getConnection()

  let fields = [
    'callid',
    'time',
    'from_user',
    'from_host',
    'to_user_r',
    'to_host',
    'ua',
    'protocol',
    'dst_host',
    'src_host'
  ]

  let conditions = []

  if (req.query.from) {
    if (req.query.from.includes('@')) {
      let t = req.query.from.split('@')
      t[0] && conditions.push(`from_user='${t[0]}'`)
      t[1] && conditions.push(`from_host='${t[1]}'`)
    } else {
      conditions.push(`from_user='${req.query.from}'`)
    }
  }

  if (req.query.to) {
    if (req.query.to.includes('@')) {
      let t = req.query.to.split('@')
      t[0] && conditions.push(`to_user_r like '${reverseString(t[0])}%'`)
      t[1] && conditions.push(`to_host='${t[1]}'`)
    } else {
      conditions.push(`to_user_r like '${reverseString(req.query.to)}%'`)
    }
  }

  if (req.query.beginTime) {
    conditions.push(`time >= '${req.query.beginTime}'`)
  }

  if (req.query.endTime) {
    conditions.push(`time <= '${req.query.endTime}'`)
  }

  let tableDate = dayjs(req.query.beginTime).format('YYYY_MM_DD')

  let sql = `select ${fields.join(',')} from inv_${tableDate} where ${conditions.join(' and ')} order by time desc limit 200`

  log.info(sql)

  let t1 = new Date().getTime()

  connection.query(sql, function (error, results, fields) {
    let t2 = new Date().getTime()

    if (error) {
      log.error(error)

      if (error.code === 'ER_NO_SUCH_TABLE') {
        createTable(tableDate)
      }

      res.status(500).end()
    } else {
      res.set('X-Sql-Time', (t2 - t1) + 'ms')
      res.json(results)
    }
  })

})

router.get('/callid', function (req, res, next) {
  let connection = getConnection()
  let sql = `select id, callid, time, cseq, protocol, method, src_host, dst_host, from_user, from_host, to_user, to_host, raw from sip_${req.query.table} where callid='${req.query.callid}' order by id`

  let t1 = new Date().getTime()

  connection.query(sql, function (error, results, fields) {
    let t2 = new Date().getTime()

    if (error) {
      log.error(error)
      res.status(500).end()
    } else {
      res.set('X-Sql-Time', (t2 - t1) + 'ms')
      res.json(results)
    }
  })
})

router.get('/stat', function (req, res, next) {
  res.json(getStat())
})

router.get('/core-dump', function (req, res, next) {
  coreDump()
  res.status(204).end();
})

module.exports = router
