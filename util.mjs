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

    if (cond.caller.length > 0) {
        if (cond.caller.indexOf('*') >= 0) {
            re.push(`from_user like '${cond.caller.replaceAll('*', '%')}'`)
        } else {
            re.push(`from_user = '${cond.caller}'`)
        }
    }

    if (cond.callee.length > 0) {
        if (cond.callee.indexOf('*') >= 0) {
            re.push(`to_user like '${cond.callee.replaceAll('*', '%')}'`)
        } else {
            re.push(`to_user = '${cond.callee}'`)
        }
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
