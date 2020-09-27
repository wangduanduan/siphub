const HEPjs = require('hep-js')
const url = require('url')
const dayjs = require('dayjs')

const { insertMsg } = require('./db/insertMsg')
const { reverseString, getLogger } = require('./util')
const { parse } = require('./src/parse')
const { update, setMaxPackageSize } = require('./statistics/counter')

const refuseFromUser = ['prober', 'dispatcher']

const log = getLogger()

function getMetaFromPaylod (payload, rinfo) {
  // console.log(payload)

  let msg = parse(payload)
  
  setMaxPackageSize(rinfo.size)

  if (!msg.call_id) {
    return
  }

  let from = url.parse(msg.from)
  let to = url.parse(msg.to)

  // log.info(from)

  return {
    method: msg.method,
    from_user: from.auth,
    from_host: from.host,
    to_user: to.auth,
    to_host: to.host,
    to_user_r: reverseString(to.auth),
    callid: msg.call_id,
    fs_callid: msg.fs_call_id,
    cseq: msg.cseq,
    ua: msg.ua,
    src_host: '',
    dst_host: '',
    timeSeconds: 0,
    raw: payload
  }
}

function onMessage (msg, rinfo) {
  // updateStat('h', 'receive', 1)
  update('hep_receive_all')

  let hep_decoder = HEPjs.decapsulate(msg)

  log.debug(hep_decoder)

  let meta = getMetaFromPaylod(hep_decoder.payload)

  if (!meta) {
    return update('hep_drop_all')
  }

  if (!meta.from_user) {
    return update('hep_drop_all')
  }

  if (refuseFromUser.includes(meta.from_user)) {
    return update('hep_drop_all')
  }

  // log.info(hep_decoder.rcinfo)
  meta.src_host = hep_decoder.rcinfo.srcIp + ':' + hep_decoder.rcinfo.srcPort
  meta.dst_host = hep_decoder.rcinfo.dstIp + ':' + hep_decoder.rcinfo.dstPort
  meta.protocol = hep_decoder.rcinfo.protocol

  log.info(hep_decoder.rcinfo)


  meta.timeSeconds = dayjs.unix(parseFloat(hep_decoder.rcinfo.timeSeconds + '.' + hep_decoder.rcinfo.timeUseconds)).format('YYYY-MM-DD HH:mm:ss.ms')

  log.info(meta)
  insertMsg(meta)
}

module.exports = {
  onMessage
}

// {
//   rcinfo: {
//     protocolFamily: 2,
//     protocol: 17,
//     srcPort: 57039,
//     dstPort: 18627,
//     timeSeconds: 1579663145,
//     timeUseconds: 471090,
//     payloadType: 1,
//     captureId: 1,
//     srcIp: '192.168.2.37',
//     dstIp: '192.168.60.101',
//     correlation_id: 'ryEvaXXfi-REsdFRGT7txq6RUyZS1r5L'
//   },
//   payload: 'ACK sip:8001@001.com SIP/2.0\r\n' +
//     'Via: SIP/2.0/UDP 192.168.1.101:57039;rport;branch=z9hG4bKPjTrHOXMu0JO7S-Gvxp4mLg2K0kolc6LGk\r\n' +
//     'Max-Forwards: 69\r\n' +
//     'From: "800004" <sip:800004@001.com>;tag=XXoSf6vn0T5LdI8o7.U2uXX2n338RF02\r\n' +
//     'To: <sip:8001@001.com>;tag=c7HN73paXcp0Q\r\n' +
//     'Call-ID: ryEvaXXfi-REsdFRGT7txq6RUyZS1r5L\r\n' +
//     'CSeq: 13048 ACK\r\n' +
//     'Route: <sip:192.168.60.101:18627;lr>\r\n' +
//     'Content-Length:  0\r\n' +
//     '\r\n'
// }
