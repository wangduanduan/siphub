const HEPjs = require('hep-js')
const dayjs = require('dayjs')
const url = require('url')

const { insertMsg } = require('./db/insertMsg')
const { reverseString, getLogger } = require('./util')
const { parse } = require('./src/parse')
const { update, setMaxPackageSize } = require('./statistics/counter')

const refuseFromUser = ['prober', 'dispatcher']

const MIN_MESSAGE_LENGTH = 24

const log = getLogger()

function getUserFromUrl (str) {
  if (!str || typeof str !== 'string' || str.length <= 2) {
    log.error('bad str', str)
    return ''
  }

  let startIndex = str.indexOf(':')
  if (startIndex === -1) {
    startIndex = 0
  }

  let endIndex = str.indexOf('@')
  if (endIndex === -1) {
    log.error('bad str', str)
    endIndex = str.length
  }

  if (startIndex >= endIndex) {
    log.error('bad str', str)
    return ''
  }

  return str.substring(startIndex, endIndex)
}

function getMetaFromPaylod (payload) {
  log.debug('function: getMetaFromPaylod', payload)

  const msg = parse(payload)

  log.debug('function: getMetaFromPaylod result', msg)

  if (!msg || !msg.call_id) {
    return
  }

  const from = url.parse(msg.from)
  const to = url.parse(msg.to)

  // log.info(from)

  return {
    method: msg.method || '',
    from_user: from.auth || '',
    from_host: from.host || '',
    to_user: to.auth || '',
    to_host: to.host || '',
    to_user_r: reverseString(to.auth) || '',
    callid: msg.call_id || '',
    fs_callid: msg.fs_call_id || '',
    cseq: msg.cseq || '',
    ua: msg.ua || '',
    src_host: '',
    dst_host: '',
    timeSeconds: 0,
    tmMethod: msg.tmMethod,
    raw: payload
  }
}

function onMessage (msg, rinfo) {
  update('hep_receive_all')
  setMaxPackageSize(rinfo.size)

  const hepDecoder = HEPjs.decapsulate(msg)

  if (hepDecoder.payload.length < MIN_MESSAGE_LENGTH) {
    log.debug('msg is two short', hepDecoder.payload)
    return
  }

  log.debug(hepDecoder)

  const meta = getMetaFromPaylod(hepDecoder.payload)

  if (!meta) {
    log.error('on-message getMeta', meta)
    return update('hep_drop_all')
  }

  if (meta.tmMethod === 'OPTIONS') {
    log.debug('useless options message')
    return
  }

  if (!meta.from_user) {
    log.error('on-message getMeta', meta)
    return update('hep_drop_all')
  }

  if (refuseFromUser.includes(meta.from_user)) {
    log.error('on-message getMeta', meta)
    return update('hep_drop_all')
  }

  // log.info(hepDecoder.rcinfo)
  meta.src_host = hepDecoder.rcinfo.srcIp + ':' + hepDecoder.rcinfo.srcPort
  meta.dst_host = hepDecoder.rcinfo.dstIp + ':' + hepDecoder.rcinfo.dstPort
  meta.protocol = hepDecoder.rcinfo.protocol

  log.info(hepDecoder.rcinfo)

  meta.timeSeconds = dayjs.unix(hepDecoder.rcinfo.timeSeconds).format('YYYY-MM-DD HH:mm:ss')

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
