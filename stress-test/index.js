const HEPjs = require('hep-js')
const dgram = require('dgram')
const { nanoid } = require('nanoid')
const client = dgram.createSocket('udp4')

const sendInter = 1
const sendTimes = 10000

var all = 0

function sendMsg (msg) {
  console.log(all, 'send')

  all++
  // client.send(msg, 31235, '192.168.40.174', (err) => {
  client.send(msg, 9060, '192.168.60.228', (err) => {
  // client.send(msg, 9060, 'localhost', (err) => {
    if (err) {
      console.error(err)
    } else {
      // console.log('send ok')
    }
  })
}

const rcinfo = {
  protocolFamily: 2,
  protocol: 17,
  srcPort: 57039,
  capturePass: 'myHep',
  dstPort: 18627,
  time_sec: new Date().valueOf() / 1000,
  time_usec: 0,
  payloadType: 1,
  captureId: 1,
  srcIp: '192.168.2.37',
  dstIp: '192.168.60.101',
  correlation_id: 'ryEvaXXfi-REsdFRGT7txq6RUyZS1r5L'
}

// console.log(rcinfo)

function createBody (params) {
  return 'INVITE sip:8001@001.com SIP/2.0\r\n' +
    'Via: SIP/2.0/UDP 192.168.1.101:57039;rport;branch=z9hG4bKPjTrHOXMu0JO7S-Gvxp4mLg2K0kolc6LGk\r\n' +
    'Max-Forwards: 69\r\n' +
    'From: "800004" <sip:800004@001.com>;tag=XXoSf6vn0T5LdI8o7.U2uXX2n338RF02\r\n' +
    'To: <sip:8001@001.com>;tag=c7HN73paXcp0Q\r\n' +
    'Call-ID: ' + nanoid() + '\r\n' +
    'CSeq: 13048 INVITE\r\n' +
    'Route: <sip:192.168.60.101:18627;lr>\r\n' +
    'Content-Length:  0\r\n' +
    '\r\n'
}

function job () {
  for (let index = 0; index < sendTimes; index++) {
    var body = createBody()
    var hepEncoder = HEPjs.encapsulate(body, rcinfo)
    sendMsg(hepEncoder)
  }
}

setInterval(job, sendInter * 1000)
