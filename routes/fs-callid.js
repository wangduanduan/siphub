const dayReg = /^\d{4}_\d{2}_\d{2}$/
// const debug = require('debug')('app:fs-callid')

function checkQuery (sipCallId, day) {
  // day format: YYYY_MM_DD
  if (!sipCallId || !day) return false
  if (!dayReg.test(day)) return false
  return true
}

function makeSql (sipCallId, day) {
  return `select fs_callid from inv_${day} where callid='${sipCallId}' limit 1`
}

function find (con, sipCallId, day, cb) {
  const sql = makeSql(sipCallId, day)
  console.log(sql)
  con.query(sql, cb)
}

module.exports = {
  checkQuery,
  find
}
