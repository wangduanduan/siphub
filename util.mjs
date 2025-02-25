import validator from 'validator'
import dayjs from 'dayjs'

const regEx = /\d+/
export function isRequest(method) {
    return !regEx.test(method)
}

export function whereBuilder(cond) {
    // day
    // start
    let re = [
        `create_time >= '${cond.day} ${cond.start}'`,
        `create_time <= '${cond.day} ${cond.stop}'`
    ]

    if (cond.caller.trim().length > 0) {
        if (cond.caller.indexOf('*') >= 0) {
            re.push(`from_user like '${cond.caller.trim().replaceAll('*', '%')}'`)
        } else {
            re.push(`from_user = '${cond.caller.trim()}'`)
        }
    }

    if (cond.callee.trim().length > 0) {
        if (cond.callee.indexOf('*') >= 0) {
            re.push(`to_user like '${cond.callee.trim().replaceAll('*', '%')}'`)
        } else {
            re.push(`to_user = '${cond.callee.trim()}'`)
        }
    }

    if (cond.callid?.trim() && cond.callid.trim().length > 0) {
        re.push(`sip_call_id = '${cond.callid.trim()}'`)
    }

    if (cond.cseq_method?.trim() && cond.cseq_method.trim().length > 0) {
        re.push(`cseq_method = '${cond.cseq_method.trim()}'`)
    }

    if (cond.src_host?.trim() && cond.src_host.trim().length > 0) {
        re.push(`src_host like '${cond.src_host.trim()}%'`)
    }

    if (cond.dst_host?.trim() && cond.dst_host.trim().length > 0) {
        re.push(`dst_host like '${cond.dst_host.trim()}%'`)
    }

    return re
}

export function conditionChecker(cond) {
    // day
    if (!validator.isDate(cond.day)) {
        return false
    }
    // start
    if (!validator.isTime(cond.start)) {
        return false
    }
    // stop
    if (!validator.isTime(cond.stop)) {
        return false
    }

    if (cond.msg_min != "" && !validator.isInt(cond.msg_min)) {
        return false
    }

    // msg_min
    // caller
    // callee
    return True
}

export function getProtocolName(num) {
    if (num === 6) {
        return 'TCP'
    }
    if (num === 17) {
        return 'UDP'
    }
    if (num === 22) {
        return 'TLS'
    }
    if (num === 50) {
        return 'ESP'
    }
    return 'Unknown'
}

export function createSeqHtml(seq) {
    const res = []

    seq.forEach((item, index) => {
        let dis = 0

        if (index !== 0) {
            const a = dayjs(seq[index].CreateTime).unix() + '.' + seq[index].TimestampMicro
            const b = dayjs(seq[index - 1].CreateTime).unix() + '.' + seq[index - 1].TimestampMicro
            dis = parseFloat(a) - parseFloat(b)
        }

        res.push(
            `${item.src_host}-${isRequest(item.sip_method) ? '' : '-'}>${item.dst_host}: F${index} **${item.sip_method}** ${item.response_desc} ${dis.toFixed(2)}s`,
        )
    })

    res.push('terminators box')

    return {
        html: res.join('\n'),
    }
}