module.exports = {
  host: process.env.dbHost || '127.0.0.1',
  user: process.env.dbUser || 'root',
  password: process.env.dbPwd || '123456',
  database: process.env.dbName || 'siphub',
  dbPort: process.env.dbPort ? parseInt(process.env.dbPort) : 3306,

  dataKeepDays: 2,
  cronTimeSecond: 10,
  logLevel: 'error',
  influxdb: process.env.influxdb || 'http://172.16.200.228:8086/write?db=siphub',
  influxdbSecond: process.env.influxdbSecond || '10',
  dbPoolSize: process.env.dbPoolSize ? parseInt(process.env.dbPoolSize) : 30,
  gateway: process.env.gateway || '192.168.1.1'
}

// curl -i -XPOST http://172.16.200.228:8086/query --data-urlencode "q=CREATE DATABASE siphub"
