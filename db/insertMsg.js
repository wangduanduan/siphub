const mysql = require('mysql')
const dayjs = require('dayjs')
const log = require('../util').getLogger()
const state = require('./state')
const mysqlErrorTips = require('./mysqlErrorTips')

const { update } = require('../statistics/counter')

function errorTips (errorCode) {
  if (mysqlErrorTips[errorCode]) {
    log.error(mysqlErrorTips[errorCode])
  }
}

function insertMsg (msg) {
  let tableDate = dayjs().format('YYYY_MM_DD')

  Object.keys(msg).forEach((key) => {
    msg[key] = msg[key] || ''
  })

  let sql = mysql.format(`insert into sip_${tableDate} (
    method,from_user,from_host,to_user,to_user_r,
    to_host,callid,cseq,protocol,src_host,
    dst_host,time,raw,ua) 
    values(
      ?,?,?,?,?,
      ?,?,?,?,?,
      ?,?,?,?)`, [msg.method, msg.from_user, msg.from_host, msg.to_user, msg.to_user_r,
    msg.to_host, msg.callid, msg.cseq, msg.protocol, msg.src_host,
    msg.dst_host, msg.timeSeconds, msg.raw, msg.ua
  ])

  let sql2 = mysql.format(`insert into inv_${tableDate} (
    from_user,from_host,to_user_r,to_host,callid,fs_callid,
    time,src_host,dst_host,ua,protocol) 
    values(?,?,?,?,?,?,
      ?,?,?,?,?)`, [msg.from_user, msg.from_host, msg.to_user_r, msg.to_host, msg.callid, msg.fs_callid,
    msg.timeSeconds, msg.src_host, msg.dst_host, msg.ua, msg.protocol
  ])

  log.info(sql, sql2)

  log.info('start insert sip table', sql)
  state.get('pool').query(sql, function (error, results, fields) {
    if (error) {
      errorTips(error.code)
      return log.error(error)
    }
    update('db_insert_all')
    log.info('insert success')
  })

  log.info('start insert inv table', sql)

  state.get('pool').query(sql2, function (error, results, fields) {
    if (error) {
      if (error.code !== 'ER_DUP_ENTRY') {
        errorTips(error.code)
        log.info(error)
      }
      return log.info('insert fail inv_, maybe dumpcate')
    }
    
    update('db_insert_all')
    log.info('insert success')
  })
}

module.exports = {
  insertMsg
}
