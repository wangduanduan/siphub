const log = require('../util').getLogger()
const state = require('./state')
const dayjs = require('dayjs')
const config = require('config')

function showTables () {
  state.get('pool')
    .query(`show tables`, function (error, results, fields) {
      if (error) {
        log.error(error)
        return
      }
      checkTable(results)
    })
}

function checkTable (results) {
  results.forEach((item) => {
    let tableName = item[`Tables_in_${config.get('database')}`]
    let day = tableName.substring(4).replace(/_/g, '-')

    let diff = dayjs().diff(dayjs(day), 'day')

    if (diff >= config.get('dataKeepDays')) {
      dropTable(tableName)
    }
  })
}

function dropTable (tableName) {
  log.info('start drop table', tableName)

  state.get('pool')
    .query(`drop table if exists ${tableName}`, function (error, results, fields) {
      if (error) {
        log.error('drop table error', error)
        return
      }
      log.info('drop table success', results)
    })
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
    \`cseq\` int(11) NOT NULL,
    \`code\` int(11) DEFAULT '0',
    PRIMARY KEY (\`callid\`),
    KEY \`from_host\` (\`from_host\`),
    KEY \`fs_callid\` (\`fs_callid\`),
    KEY \`to_host\` (\`to_host\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;`

  // log.info(sql)

  state.get('pool').query(sql + sql2, function (error, results, fields) {
    if (error) {
      log.error(error)
    }
  })
}

module.exports = {
  createTable,
  showTables
}
