import express from 'express'
import bodyParser from 'body-parser'
import { AppLoger, logger } from './logger.mjs'
import dayjs from 'dayjs'
import { route } from './router/api.mjs'
import { queryRecord } from './db.mjs'

const app = express()

app.use(AppLoger())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'))
app.set('view engine', 'ejs')

app.get('/', async function (req, res) {
  let n = dayjs()
  let day = n.format('YYYY-MM-DD')
  let start = n.subtract(10, 'm').format('HH:mm:ss')
  let stop = n.format('HH:mm:ss')

  let result = await queryRecord({
    day,
    start,
    stop,
    caller: '',
    callee: '',
    msg_min: 1
  })

  res.render('home/index', {
    day,
    start,
    stop,
    table: result.rows
  })
})

app.use('/api', route)

app.listen(3000)