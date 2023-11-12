import dayjs from 'dayjs'
import { BaseType } from './interface'

const dateFormat = 'YYYY-MM-DD HH:mm:ss'

export function getProtocolName(num: number) {
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

export function stringToColor(str: string) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }

    let color = '#'

    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff
        const v16 = '00' + value.toString(16)
        color += v16.substring(v16.length - 2)
    }
    return color
}

const regEx = /\d+/
export function isRequest(method: string) {
    return !regEx.test(method)
}

export function formatLongTime(t: string) {
    return dayjs(t).format(dateFormat)
}

export function createSeqHtml(seq: BaseType[], startIndex: number) {
    const res: string[] = [`autolabel "[<inc>] <label>"`]

    if (!startIndex) {
        startIndex = 0
    }

    seq.forEach((item, index) => {
        item.SIPProtocolName = getProtocolName(item.SIPProtocol)

        let dis = 0

        if (index !== 0) {
            const a = dayjs(seq[index].CreateTime).unix() + '.' + seq[index].TimestampMicro
            const b = dayjs(seq[index - 1].CreateTime).unix() + '.' + seq[index - 1].TimestampMicro
            dis = parseFloat(a) - parseFloat(b)
        }

        item.CreateTimeShort = dayjs(item.CreateTime).format('HH:mm:ss')

        res.push(
            `${item.SrcHost}-${isRequest(item.SIPMethod) ? '' : '-'}>${item.DstHost}: **${item.SIPMethod}** ${
                item.ResponseDesc
            } ${dis.toFixed(1)}s ${stringToColor(item.CSeqNumber + '')}`,
        )
        item.RawMsg = item.RawMsg.trim()
        item.CreateTimeLong = dayjs(item.CreateTime).format('YYYY-MM-DD HH:mm:ss')
    })

    res.push('terminators box')

    return {
        html: res.join('\n'),
    }
}
