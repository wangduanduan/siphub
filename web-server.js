const express = require('express')
const app = express()
const path = require('path')
const responseTime = require('response-time')
const routes = require('./routes/index')
const api = require('./routes/api')
const { initPool } = require('./mysql')

function createWebServer (port) {
  initPool()

  app.set('views', path.join(__dirname, 'views'))
  app.engine('html', require('ejs').renderFile)
  app.set('view engine', 'html')
  app.use(responseTime())
  app.use(express.static(path.join(__dirname, 'public'), { maxAge: 0 }))
  app.use('/', routes)
  app.use('/api', api)
  app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}

module.exports = {
  createWebServer
}
