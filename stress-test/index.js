const HEPjs = require('hep-js')
const dgram = require('dgram')
const { nanoid } = require('nanoid')
const client = dgram.createSocket('udp4')

const sendInter = 1
const sendTimes = 3

let all = 0
const MAX = 3

function sendMsg (msg) {
  console.log(new Date(), all, 'send')

  all++
  if (all > MAX) {
    process.exit(0)
  }
  // client.send(msg, 31235, '192.168.40.174', (err) => {
  client.send(msg, 9060, 'localhost', (err) => {
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

function createBody1 (params) {
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

function createBody2 () {
  return 'REGISTER sip:001.com SIP/2.0\r\n' +
  'Via: SIP/2.0/UDP 192.168.2.13:59782;rport;branch=z9hG4bKPjyHhEVr-4LAM8UOH5wzO640mWMllHHo76\r\n' +
  'Route: <sip:192.168.40.21:18627;lr>\r\n' +
  'Max-Forwards: 70\r\n' +
  'From: "8003" <sip:8003@001.com>;tag=0IBGEpncOzTrtjcx4DjdU6kEVIJw8s0Q\r\n' +
  'To: "8003" <sip:8003@001.com>\r\n' +
  'Call-ID: ' + nanoid() + '\r\n' +
  'CSeq: 38689 REGISTER\r\n' +
  'User-Agent: Telephone 1.5.1\r\n' +
  'Contact: "8003" <sip:8003@192.168.2.13:59782;ob>\r\n' +
  'Expires: 300\r\n' +
  'Allow: PRACK, INVITE, ACK, BYE, CANCEL, UPDATE, INFO, SUBSCRIBE, NOTIFY, REFER, MESSAGE, OPTIONS\r\n' +
  'Content-Length:  0\r\n'
}

function body3 () {
  return 'INVITE sip:80003@172.16.10.226:18627 SIP/2.0\r\n' +
  'Via: SIP/2.0/UDP 172.16.10.221:8629;rport;branch=z9hG4bK20te23BUp95He\r\n' +
  'Max-Forwards: 69\r\n' +
  'From: "80003" <sip:80003@172.16.10.221>;tag=yF6vUF0vceXSK\r\n' +
  'To: <sip:80003@shljz.cc>\r\n' +
  'Call-ID: ' + nanoid() + '\r\n' +
  'CSeq: 29877181 INVITE\r\n' +
  'Contact: <sip:mod_sofia@172.16.10.221:8629>\r\n' +
  'Call-Info: <Answer-After=0>\r\n' +
  'User-Agent: wms\r\n' +
  'Allow: INVITE, ACK, BYE, CANCEL, OPTIONS, MESSAGE, INFO, UPDATE, REGISTER, REFER, NOTIFY\r\n' +
  'Supported: timer, path, replaces\r\n' +
  'Allow-Events: talk, hold, conference, refer\r\n' +
  'Content-Type: application/sdp\r\n' +
  'X-callid: 1234567\r\n' +
  'Content-Disposition: session\r\n' +
  'Content-Length: 235\r\n' +
  'Wellcloud_Call_ID: 6886c310-28a8-4f04-9170-6a79f4ab2285\r\n' +
  'Wellcloud_Call_Cause: MakeCall\r\n' +
  'X-FS-Support: update_display,send_info\r\n' +
  'Remote-Party-ID: "80003" <sip:80003@172.16.10.221>;party=calling;screen=yes;privacy=off\r\n' +
  '\r\n' +
  'v=0\r\n' +
  'o=wms 1608844694 1608844695 IN IP4 172.16.10.221\r\n' +
  's=wms\r\n' +
  'c=IN IP4 172.16.10.221\r\n' +
  't=0 0\r\n' +
  'm=audio 17252 RTP/AVP 0 8 101 13\r\n' +
  'a=rtpmap:0 PCMU/8000\r\n' +
  'a=rtpmap:8 PCMA/8000\r\n' +
  'a=rtpmap:101 telephone-event/8000\r\n' +
  'a=fmtp:101 0-16\r\n' +
  'a=ptime:20\r\n'
}

function job () {
  for (let index = 0; index < sendTimes; index++) {
    const body = body3()
    const hepEncoder = HEPjs.encapsulate(body, rcinfo)
    sendMsg(hepEncoder)
  }
}

setInterval(job, sendInter * 1000)
