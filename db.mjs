import pg from 'pg'
import { AppEnv } from './env.mjs'
import { logger } from './logger.mjs'
import { whereBuilder } from './util.mjs'
const { Client, Pool } = pg
import dayjs from 'dayjs'

const pool = new Pool({
    user: AppEnv.DBUser,
    password: AppEnv.DBPasswd,
    host: AppEnv.DBAddr,
    port: AppEnv.DBPort,
    database: AppEnv.DBName,
    idleTimeoutMillis: 30000,
    max: 20,
    connectionTimeoutMillis: 2000,
})

function getTableNameByDay(day) {
    let today = dayjs().format('YYYY-MM-DD')
    if (day === today) {
        return 'records'
    }

    return `records_${day.replaceAll('-', '')}`
}

export async function tableSplit() {
    let tableDay = dayjs().subtract(1, 'day').format("YYYYMMDD")

    const sql = `
        CREATE table if not exists records_tmp (LIKE public.records INCLUDING all);
        ALTER TABLE records RENAME TO records_${tableDay};
        ALTER TABLE records_tmp RENAME TO records;
    `

    logger.info(sql)

    return await pool.query(sql)
}

export async function deleteTable() {
    let res = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' and 
        table_name like 'records_%' 
        order by table_name desc 
        offset ${AppEnv.dataKeepDays};
    `)

    if (res.rows.length === 0) {
        logger.info("没有需要删除的表")
    }

    for (const ele of res.rows) {
        console.log(ele.table_name)
        logger.info(`try delete table ${ele.table_name}`)
        await pool.query(`DROP TABLE IF EXISTS ${ele.table_name}`)
    }
}

export async function queryRecord(c) {
    logger.info(c)
    let wh = whereBuilder(c)
    const sql = `
      select
        sip_call_id as "CallID",
        to_char(min(create_time),'HH24:MI:SS') as "startTime",
        to_char(min(create_time),'YYYY-MM-DD') as "day",
        to_char(max(create_time),'HH24:MI:SS') as "stopTime",
        to_char(max(create_time) - min(create_time),'HH24:MI:SS') as "duration",
        min(from_user) as "caller",
        min(to_user) as "callee",
        count(*)::int as "msgTotal",
        min(user_agent) as "UA",
        max(response_code)::int as "finalCode",
        string_agg(DISTINCT CASE WHEN response_code BETWEEN 170 AND 190 THEN response_code::text END, ',') AS "tempCode"
    from
        public.${getTableNameByDay(c.day)}
    where
        ${wh.join(' and ')}
    group by sip_call_id 
    having count(*) >= ${c.msg_min}
    order by "startTime" desc
    limit ${AppEnv.QueryLimit}
    `

    logger.info(sql)
    const res = await pool.query(sql)

    return res
}


export async function queryById(id, day) {
    const sql = `
    select
    sip_call_id,
	sip_method,
	to_char(create_time,
	'YYYY-MM-DD HH24:MI:SS') as create_time,
	timestamp_micro,
	raw_msg,
    cseq_number,
	case 
		when sip_protocol = 6 then 'TCP'
		when sip_protocol = 17 then 'UDP'
		when sip_protocol = 22 then 'TLS'
		when sip_protocol = 50 then 'ESP'
		else 'Unknown'
	end as sip_protocl,
	replace(src_host,':','_') as src_host,
	replace(dst_host,':','_') as dst_host,
    response_desc,
    length(raw_msg) as msg_len
    from
        public.${getTableNameByDay(day)}
    where
        sip_call_id = '${id}'
    order by create_time , timestamp_micro 
    `

    logger.info(sql)
    const res = await pool.query(sql)

    return res
}