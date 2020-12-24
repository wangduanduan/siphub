const log = require('./util').getLogger()
const mysql = require('mysql')
const dayjs = require('dayjs')
const config = require('config')
const mysqlErrorTips = require('./db/mysqlErrorTips')
const state = require('./db/state')
const { createTable, showTables } = require('./db/table')

function errorTips (errorCode) {
  if (mysqlErrorTips[errorCode]) {
    log.error(mysqlErrorTips[errorCode])
  }
}

function reconnetMysql () {
  setTimeout(() => {
    log.info('start reconnect mysql')
    initPool()
  }, 4000)
}

function initPool () {
  log.info(`start init mysql Pool ${config.get('user')}@${config.get('host')}/${config.get('database')}`)

  const pool = mysql.createPool({
    connectionLimit: config.get('dbPoolSize'),
    host: config.get('host'),
    user: config.get('user'),
    password: config.get('password'),
    database: config.get('database'),
    multipleStatements: true
  })

  state.set('pool', pool)

  pool.on('acquire', function (connection) {
    log.debug('mysql Connection %d acquired', connection.threadId)
  })

  pool.on('connection', function (connection) {
    // connection.query('SET SESSION auto_increment_increment=1')

    log.debug('mysql connection create', connection.threadId)

    connection.on('error', function onError (error) {
      errorTips(error.code)
      log.error(error)
    })
  })

  pool.on('enqueue', function () {
    log.debug('mysql Waiting for available connection slot')
  })

  pool.on('release', function (connection) {
    log.debug('mysql Connection %d released', connection.threadId)
  })

  const today = dayjs().format('YYYY_MM_DD')

  createTable(today)
  startCronJob()
  cronJob()

  pool.on('error', function (err) {
    log.error(err.code) // 'ECONNREFUSED'
    log.error(err.fatal) // true
    reconnetMysql()
  })
}

function cronJob () {
  createTable()
  showTables()
}

function startCronJob () {
  setInterval(cronJob, 1000 * config.get('cronTimeSecond'))
}

module.exports = {
  initPool
}
