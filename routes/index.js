var express = require('express')
var config = require('config')
var router = express.Router()
const {
  getStat,
  getPeekStat,
  getMaxPackageSize
} = require('../statistics/counter')

router.get('/', function (req, res, next) {
  res.render('index')
})

router.get('/call', function (req, res, next) {
  res.render('call', {
    callid: req.query.callid
  })
})

router.get('/import', function (req, res, next) {
  res.render('import')
})

router.get('/monitor', function (req, res, next) {
  res.render('monitor', {
    ...getStat(),
    ...getPeekStat(),
    ...process.memoryUsage(),
    uptime: process.uptime(),
    dbPoolSize: config.get('dbPoolSize'),
    maxPackageSize: getMaxPackageSize()
  })
})

module.exports = router
