import { Router } from "express"
import { logger } from "../logger.mjs"
import { queryRecord, queryById } from "../db.mjs"
import { table } from "console"
import { createSeqHtml } from "../util.mjs"

export const route = Router()

route.post('/record', async (req, res) => {
    let re = await queryRecord(req.body)
    res.render('home/sipcdr', { table: re.rows })
})

route.get('/call', async (req, res) => {
    let re = await queryById(req.query.id, req.query.day)
    let rows = re.rows
    let seq = createSeqHtml(rows)
    logger.debug(seq)

    res.render('diagram/index', {
        seq: seq.html, table: rows
    })
})

