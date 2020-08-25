module.exports = {
  host: process.env.dbHost,
  user: process.env.dbUser,
  password: process.env.dbPwd,
  database: process.env.dbName,
  dataKeepDays: process.env.dataKeepDays ? parseInt(process.env.dataKeepDays) : 3,
  cronTimeSecond: 7200,
  logLevel: process.env.logLevel || 'error'
}
