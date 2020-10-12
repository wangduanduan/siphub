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

function updateCode (code, callid, cseq) {
  const tableDate = dayjs().format('YYYY_MM_DD')

  const sql = mysql.format(`UPDATE inv_${tableDate} SET code=? WHERE callid = ? and cseq = ? and code < ?`, [code, callid, cseq, code])

  log.info(sql)

  log.info('start update code', sql)

  state.get('pool').query(sql, function (error, results, fields) {
    if (error) {
      errorTips(error.code)
      return log.error(error)
    }
  })
}

module.exports = {
  updateCode
}
