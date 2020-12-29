const express = require('express')
const router = express.Router()
const {
  getLogger,
  reverseString
} = require('../util')
const state = require('../db/state')
const {
  createTable
} = require('../db/table')
const dayjs = require('dayjs')
const {
  getStat,
  getPeekStat
} = require('../statistics/counter')
const {
  coreDump
} = require('../core-dump')
const fsCallHand = require('./fs-callid')

const log = getLogger()

router.get('/search', function (req, res, next) {
  const pool = state.get('pool')

  const fields = [
    'callid',
    'method',
    'time',
    'from_user',
    'from_host',
    'to_user_r',
    'to_host',
    'ua',
    'protocol',
    'dst_host',
    'src_host',
    'fs_callid'
  ]

  const conditions = []

  if (req.query.from) {
    if (req.query.from.includes('@')) {
      const t = req.query.from.split('@')
      t[0] && conditions.push(`from_user='${t[0]}'`)
      t[1] && conditions.push(`from_host='${t[1]}'`)
    } else {
      conditions.push(`from_user='${req.query.from}'`)
    }
  }

  if (req.query.to) {
    if (req.query.to.includes('@')) {
      const t = req.query.to.split('@')
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

  if (req.query.fs_callid) {
    conditions.push(`fs_callid = '${req.query.fs_callid}'`)
  }

  if(req.query.method)
  {
    conditions.push(`method = '${req.query.method}'`)
  }
  const tableDate = dayjs(req.query.beginTime).format('YYYY_MM_DD')

  const limit = '200'

  const sql = `select ${fields.join(',')} from inv_${tableDate} where ${conditions.join(' and ')} order by time desc limit ${limit}`

  log.info(sql)

  const t1 = new Date().getTime()

  pool.query(sql, function (error, results, fields) {
    const t2 = new Date().getTime()

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
  const pool = state.get('pool')

  const sql = `select id, callid, time, cseq, protocol, method, src_host, dst_host, from_user, from_host, to_user, to_host, raw from sip_${req.query.table} where callid='${req.query.callid}' order by id`

  const t1 = new Date().getTime()

  pool.query(sql, function (error, results, fields) {
    const t2 = new Date().getTime()

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
  res.json({
    stat: getStat(),
    peek: getPeekStat()
  })
})

router.get('/core-dump', function (req, res, next) {
  coreDump()
  res.status(204).end()
})

router.get('/fs-callid', function getFsCallId (req, res, next) {
  const day = req.query.day || dayjs().format('YYYY_MM_DD')

  if (!fsCallHand.checkQuery(req.query.sipCallId, day)) return res.status(400).end()

  fsCallHand.find(state.get('pool'), req.query.sipCallId, day, (error, results, fields) => {
    if (error) {
      log.error(error)
      return res.status(500).end()
    }

    if (results.length === 0) {
      return res.status(404).end()
    }

    if (!results[0].fs_callid) {
      return res.status(404).end()
    }

    return res.json({
      fs_callid: results[0].fs_callid
    }).end()
  })
})

module.exports = router
