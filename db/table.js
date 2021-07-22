const log = require('../util').getLogger()
const state = require('./state')
const dayjs = require('dayjs')
const config = require('config')

function showTables () {
  state.get('pool')
    .query('show tables', function (error, results, fields) {
      if (error) {
        log.error(error)
        return
      }
      checkTable(results)
    })
}

function checkTable (results) {
  results.forEach((item) => {
    const tableName = item[`Tables_in_${config.get('database')}`]
    const day = tableName.substring(4).replace(/_/g, '-')

    const diff = dayjs().diff(dayjs(day), 'day')

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
  const tableName = tableDate || dayjs().add(1, 'day').format('YYYY_MM_DD')
  let partDate = tableName.replace(/_/g, '-')

  const sql = `create table if not exists sip_${tableName} (
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

  const sql2 = `CREATE TABLE if not exists inv_${tableName} (
    \`callid\` char(64) NOT NULL DEFAULT '',
    \`fs_callid\` char(64) NOT NULL DEFAULT '',
    \`protocol\` int(11) NOT NULL,
    \`method\` char(20) NOT NULL DEFAULT '',
    \`from_user\` char(40) NOT NULL DEFAULT '',
    \`from_host\` char(64) NOT NULL DEFAULT '',
    \`to_user_r\` char(40) NOT NULL DEFAULT '',
    \`to_host\` char(64) NOT NULL DEFAULT '',
    \`ua\` char(40) NOT NULL DEFAULT '',
    \`src_host\` char(32) NOT NULL DEFAULT '',
    \`dst_host\` char(32) NOT NULL DEFAULT '',
    \`time\` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`callid\`,\`time\`),
    KEY \`from_host\` (\`from_host\`),
    KEY \`fs_callid\` (\`fs_callid\`),
    KEY \`to_host\` (\`to_host\`),
    KEY \`time\` (\`time\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8
      PARTITION BY RANGE COLUMNS(\`time\`) (
      PARTITION p9 values less than ('${partDate} 09:00:00'),
      PARTITION p10 values less than ('${partDate} 10:00:00'),
      PARTITION p11 values less than ('${partDate} 11:00:00'),
      PARTITION p12 values less than ('${partDate} 12:00:00'),
      PARTITION p13 values less than ('${partDate} 13:00:00'),
      PARTITION p14 values less than ('${partDate} 14:00:00'),
      PARTITION p15 values less than ('${partDate} 15:00:00'),
      PARTITION p16 values less than ('${partDate} 16:00:00'),
      PARTITION p17 values less than ('${partDate} 17:00:00'),
      PARTITION p18 values less than ('${partDate} 18:00:00'),
      PARTITION p19 values less than ('${partDate} 19:00:00'),
      PARTITION p20 values less than ('${partDate} 20:00:00'),
      PARTITION p24 values less than ('${partDate} 23:59:59')
  )
  `

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
