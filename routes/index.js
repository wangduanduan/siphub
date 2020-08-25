var express = require('express')
var router = express.Router()

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
  res.render('monitor')
})


module.exports = router
