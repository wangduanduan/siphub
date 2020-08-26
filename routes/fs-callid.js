const dayReg = /^\d{4}_\d{2}_\d{2}$/
const {format} = require('mysql')

function checkQuery (sipCallId, day) {
    // day format: YYYY_MM_DD
    if (!sipCallId || !day) return false
    if (!dayReg.test(day)) return false
    return true
}

function makeSql (sipCallId, day) {
    return format('select fs_callid from inv_? where callid=?', [day, sipCallId])
}

function find (con, sipCallId, day, cb) {
    let sql = makeSql(day,sipCallId)
    con.query(sql, cb)
}



module.exports = {
    checkQuery,
    find
}