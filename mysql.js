const log = require('./util').getLogger()
const mysql = require('mysql')
const dayjs = require('dayjs')
const config = require('config')
const {
  updateStat
} = require('./statis')

let connection

function reconnetMysql () {
  setTimeout(() => {
    log.info('start reconnect mysql')
    createConn()
  }, 4000)
}

function createConn () {
  log.info(`start connect mysql ${config.get('user')}@${config.get('host')}/${config.get('database')}`)

  connection = mysql.createConnection({
    host: config.get('host'),
    user: config.get('user'),
    password: config.get('password'),
    database: config.get('database'),
    multipleStatements: true
  })

  connection.connect(function (err) {
    if (err) {
      log.error('connect mysql failed', err.code) // 'ECONNREFUSED'
      log.error(err.fatal) // true
    } else {
      log.info('connect mysql success')
      let today = dayjs().format('YYYY_MM_DD')

      createTable(today)
      startCronJob()
      cronJob()
    }
  })

  connection.on('error', function (err) {
    log.error(err.code) // 'ECONNREFUSED'
    log.error(err.fatal) // true
    reconnetMysql()
  })
}

function insert (msg) {
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
    msg.dst_host, msg.timeSeconds, msg.raw, msg.ua])

  let sql2 = mysql.format(`insert into inv_${tableDate} (
    from_user,from_host,to_user_r,to_host,callid,fs_callid,
    time,src_host,dst_host,ua,protocol) 
    values(?,?,?,?,?,?,
      ?,?,?,?,?)`, [msg.from_user, msg.from_host, msg.to_user_r, msg.to_host, msg.callid, msg.fs_callid,
    msg.timeSeconds, msg.src_host, msg.dst_host, msg.ua, msg.protocol])

  log.info(sql, sql2)

  log.info('start insert sip table', sql)
  connection.query(sql, function (error, results, fields) {
    if (error) {
      return log.error(error)
    }
    updateStat('h', 'insertdb', 1)
    log.info('insert success')
  })

  log.info('start insert inv table', sql)
  connection.query(sql2, function (error, results, fields) {
    if (error) {
      if (error.code !== 'ER_DUP_ENTRY') {
        log.info(error)
      }
      return log.info('insert fail inv_, maybe dumpcate')
    }
    updateStat('h', 'insertdb', 1)
    log.info('insert success')
  })
}

// insert(msg)

function getConnection () {
  return connection
}

function createTable (tableDate) {
  let tableName = tableDate || dayjs().add(1, 'day').format('YYYY_MM_DD')

  let sql = `create table if not exists sip_${tableName} (
    \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT,
    \`method\` char(20) NOT NULL DEFAULT '',
    \`from_user\` char(40) NOT NULL DEFAULT '',
    \`from_host\` char(64) NOT NULL DEFAULT '',
    \`to_user\` char(40) NOT NULL DEFAULT '',
    \`to_user_r\` char(40) NOT NULL DEFAULT '',
    \`to_host\` char(64) NOT NULL DEFAULT '',
    \`callid\` char(64) NOT NULL DEFAULT '',
    \`cseq\` int(11) NOT NULL,
    \`protocol\` int(11) NOT NULL,
    \`ua\` char(40) NOT NULL DEFAULT '',
    \`src_host\` char(32) NOT NULL DEFAULT '',
    \`dst_host\` char(32) NOT NULL DEFAULT '',
    \`time\` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
    \`RAW\` text NOT NULL,
    PRIMARY KEY (\`id\`),
    KEY \`callid\` (\`callid\`)
  ) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;`

  let sql2 = `CREATE TABLE if not exists inv_${tableName} (
    \`callid\` char(64) NOT NULL DEFAULT '',
    \`fs_callid\` char(64) NOT NULL DEFAULT '',
    \`protocol\` int(11) NOT NULL,
    \`from_user\` char(40) NOT NULL DEFAULT '',
    \`from_host\` char(64) NOT NULL DEFAULT '',
    \`to_user_r\` char(40) NOT NULL DEFAULT '',
    \`to_host\` char(64) NOT NULL DEFAULT '',
    \`ua\` char(40) NOT NULL DEFAULT '',
    \`src_host\` char(32) NOT NULL DEFAULT '',
    \`dst_host\` char(32) NOT NULL DEFAULT '',
    \`time\` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`callid\`),
    KEY \`from_host\` (\`from_host\`),
    KEY \`fs_callid\` (\`fs_callid\`),
    KEY \`to_host\` (\`to_host\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;`

  // log.info(sql)

  connection.query(sql + sql2, function (error, results, fields) {
    if (error) {
      log.error(error)
    }
  })
}

function cronJob () {
  createTable()
  showTables()
}

function startCronJob () {
  setInterval(cronJob, 1000 * config.get('cronTimeSecond'))
}

function showTables () {
  connection.query(`show tables`, function (error, results, fields) {
    if (error) {
      log.error(error)
      return
    }
    // log.info(results)
    // log.info(results)
    checkTable(results)
  })
}

function checkTable (results) {
  results.forEach((item) => {
    let tableName = item[`Tables_in_${config.get('database')}`]
    let day = tableName.substring(4).replace(/_/g, '-')
    // log.info('table day', day)

    let diff = dayjs().diff(dayjs(day), 'day')

    if (diff > config.get('dataKeepDays')) {
      dropTable(tableName)
    }
  })
}

function dropTable (tableName) {
  log.info('start drop table', tableName)
  connection.query(`drop table if exists ${tableName}`, function (error, results, fields) {
    if (error) {
      log.error('drop table error', error)
      return
    }
    // log.info(results)
    log.info('drop table success', results)
  })
}

module.exports = {
  insert,
  getConnection,
  createTable,
  createConn
}
