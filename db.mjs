import pg from 'pg'
import { AppEnv } from './env.mjs'
import { logger } from './logger.mjs'
import { whereBuilder } from './util.mjs'
const { Client, Pool } = pg

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



export async function queryRecord(c) {
    logger.info(c)
    console.log(c)
    let wh = whereBuilder(c)
    const sql = `
      select
        sip_call_id as "CallID",
        to_char(min(create_time),'HH24:MI:SS') as "startTime",
        to_char(max(create_time),'HH24:MI:SS') as "stopTime",
        to_char(max(create_time) - min(create_time),'HH24:MI:SS') as "duration",
        min(from_user) as "caller",
        min(to_user) as "callee",
        count(*)::int as "msgTotal",
        min(user_agent) as "UA",
        max(response_code)::int as "finalCode",
        string_agg(DISTINCT CASE WHEN response_code BETWEEN 170 AND 190 THEN response_code::text END, ',') AS "tempCode"
    from
        public.records
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
	public.records
where
	sip_call_id = '${id}'
order by
	create_time ,
	timestamp_micro 
    `

    logger.info(sql)
    const res = await pool.query(sql)

    return res
}