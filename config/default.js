module.exports = {
  host: process.env.dbHost || '192.168.60.132',
  user: process.env.dbUser || 'root',
  password: process.env.dbPwd || 'wellcloud',
  database: process.env.dbName || 'siphub',
  
  dataKeepDays: 3,
  cronTimeSecond: 10,
  logLevel: 'debug',
  influxdb: process.env.influxdb || 'http://172.16.200.228:8086/write?db=siphub',
  influxdbSecond: process.env.influxdbSecond || '10'
}

// curl -i -XPOST http://172.16.200.228:8086/query --data-urlencode "q=CREATE DATABASE siphub"