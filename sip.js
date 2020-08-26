const log = require('./util').getLogger()
const re = /<(.*?)>/
const filterMethods = ['REGISTER', 'OPTIONS']

function getValue (msg) {
  let res = msg.split(': ')
  if (res[1]) {
    return res[1].trim()
  }
  return ''
}

function dealLineOne (head) {
  let lines = head.split(' ')

  return head.startsWith('SIP') ? lines[1] : lines[0]
}

function parse (msg) {
  let lines = msg.split('\r\n')
  let method = dealLineOne(lines[0])

  if (filterMethods.includes(method)) {
    return {}
  }

  let count = 0

  let from = ''
  let to = ''
  let call_id = ''
  let cseq = ''
  let ua = ''
  let fs_call_id = ''

  for (let i = 1; i < lines.length; i++) {
    // log.info('lines >>', lines[i])

    if (lines[i].startsWith('From:')) {
      count++
      let res = lines[i].match(re)
      from = res ? res[1] : ''
    } else if (lines[i].startsWith('To:')) {
      count++
      let res = lines[i].match(re)
      to = res ? res[1] : lines[i].split(': ')[1]
    } else if (lines[i].startsWith('Call-ID:')) {
      count++
      call_id = getValue(lines[i])
    } else if (lines[i].startsWith('CSeq:')) {
      count++

      // 过滤注册和OPTIONS请求的响应

      if (lines[i].includes('REGISTER')) {
        return {}
      }
      if (lines[i].includes('OPTIONS')) {
        return {}
      }

      let _seq = lines[i].split(' ')[1]
      cseq = parseInt(_seq)

    } else if (lines[i].startsWith('User-Agent:')) {
      count++
      ua = getValue(lines[i])
    } else if (lines[i].startsWith('Wellcloud_Call_ID:')) {
      count++
      fs_call_id = getValue(lines[i])
    }

    if (count >= 6) {
      break
    }

    // stop parse udp
    if (lines[i].startsWith('v=')) {
      break
    }
  }

  return {
    method,
    from,
    to,
    ua,
    cseq,
    call_id,
    fs_call_id
  }
}

module.exports = {
  parse
}

// var msg1 = 'SIP/2.0 404 Not Found\r\n' +
//     'Via: SIP/2.0/UDP 192.168.1.101:57039;received=192.168.2.37;rport=57039;branch=z9hG4bKPjfcCCXpqtwrpKQYK39H3oTNFwp4JdS7Xe\r\n' +
//     'Max-Forwards: 68\r\n' +
//     'From: "800004" <sip:800004@001.com>;tag=v2Gl2kKLlTNNC.Nydij-ri02clU52sTZ\r\n' +
//     'To: <sip:8001@001.com>;tag=F9vgt16aDKQmD\r\n' +
//     'Call-ID: cH.VUFyVvmS5aNUWQtsmgoLylRAEXnMW\r\n' +
//     'CSeq: 22855 INVITE\r\n' +
//     'User-Agent: WSS\r\n' +
//     'Accept: application/sdp\r\n' +
//     'Allow: INVITE, ACK, BYE, CANCEL, OPTIONS, MESSAGE, INFO, UPDATE, REGISTER, REFER, NOTIFY, PUBLISH, SUBSCRIBE\r\n' +
//     'Supported: timer, path, replaces\r\n' +
//     'Allow-Events: talk, hold, conference, presence, as-feature-event, dialog, line-seize, call-info, sla, include-session-description, presence.winfo, message-summary, refer\r\n' +
//     'Reason: Q.850;cause=1;text="UNALLOCATED_NUMBER"\r\n' +
//     'Content-Length: 0\r\n' +
//     '\r\n'

// var msg2 = 'ACK sip:8001@001.com SIP/2.0\r\n' +
//     'Via: SIP/2.0/UDP 192.168.60.101:18627;branch=z9hG4bKfee.a8c4d037.0\r\n' +
//     'From: "800004" <sip:800004@001.com>;tag=v2Gl2kKLlTNNC.Nydij-ri02clU52sTZ\r\n' +
//     'Call-ID: cH.VUFyVvmS5aNUWQtsmgoLylRAEXnMW\r\n' +
//     'To: <sip:8001@001.com>;tag=F9vgt16aDKQmD\r\n' +
//     'CSeq: 22855 ACK\r\n' +
//     'Max-Forwards: 70\r\n' +
//     'Route: <sip:192.168.60.101:18627;lr>\r\n' +
//     'User-Agent: WSS\r\n' +
//     'Content-Length: 0\r\n' +
//     '\r\n'

// var msg3 = 'INVITE sip:8001@001.com SIP/2.0\r\n' +
//     'Record-Route: <sip:192.168.60.101:18627;lr;ftag=v2Gl2kKLlTNNC.Nydij-ri02clU52sTZ;did=cec.d7a2f4a6>\r\n' +
//     'Via: SIP/2.0/UDP 192.168.60.101:18627;branch=z9hG4bKfee.a8c4d037.0\r\n' +
//     'Via: SIP/2.0/UDP 192.168.1.101:57039;received=192.168.2.37;rport=57039;branch=z9hG4bKPjfcCCXpqtwrpKQYK39H3oTNFwp4JdS7Xe\r\n' +
//     'Max-Forwards: 69\r\n' +
//     'From: "800004" <sip:800004@001.com>;tag=v2Gl2kKLlTNNC.Nydij-ri02clU52sTZ\r\n' +
//     'To: <sip:8001@001.com>\r\n' +
//     'Contact: "800004" <sip:800004@192.168.2.37:57039;ob>\r\n' +
//     'Call-ID: cH.VUFyVvmS5aNUWQtsmgoLylRAEXnMW\r\n' +
//     'CSeq: 22855 INVITE\r\n' +
//     'Route: <sip:192.168.60.101:18627;lr>\r\n' +
//     'Allow: PRACK, INVITE, ACK, BYE, CANCEL, UPDATE, INFO, SUBSCRIBE, NOTIFY, REFER, MESSAGE, OPTIONS\r\n' +
//     'Supported:'

// console.log(parse(msg1))
