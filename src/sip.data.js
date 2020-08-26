module.exports.msg1 = 'SIP/2.0 404 Not Found\r\n' +
    'Via: SIP/2.0/UDP 192.168.1.101:57039;received=192.168.2.37;rport=57039;branch=z9hG4bKPjfcCCXpqtwrpKQYK39H3oTNFwp4JdS7Xe\r\n' +
    'Max-Forwards: 68\r\n' +
    'From: "800004" <sip:800004@001.com>;tag=v2Gl2kKLlTNNC.Nydij-ri02clU52sTZ\r\n' +
    'To: <sip:8001@001.com>;tag=F9vgt16aDKQmD\r\n' +
    'Call-ID: cH.VUFyVvmS5aNUWQtsmgoLylRAEXnMW\r\n' +
    'CSeq: 22855 INVITE\r\n' +
    'User-Agent: WSS\r\n' +
    'Accept: application/sdp\r\n' +
    'Allow: INVITE, ACK, BYE, CANCEL, OPTIONS, MESSAGE, INFO, UPDATE, REGISTER, REFER, NOTIFY, PUBLISH, SUBSCRIBE\r\n' +
    'Supported: timer, path, replaces\r\n' +
    'Allow-Events: talk, hold, conference, presence, as-feature-event, dialog, line-seize, call-info, sla, include-session-description, presence.winfo, message-summary, refer\r\n' +
    'Reason: Q.850;cause=1;text="UNALLOCATED_NUMBER"\r\n' +
    'Content-Length: 0\r\n' +
    '\r\n'

module.exports.msg2 = 'ACK sip:8001@001.com SIP/2.0\r\n' +
    'Via: SIP/2.0/UDP 192.168.60.101:18627;branch=z9hG4bKfee.a8c4d037.0\r\n' +
    'From: "800004" <sip:800004@001.com>;tag=v2Gl2kKLlTNNC.Nydij-ri02clU52sTZ\r\n' +
    'Call-ID: cH.VUFyVvmS5aNUWQtsmgoLylRAEXnMW\r\n' +
    'To: <sip:8001@001.com>;tag=F9vgt16aDKQmD\r\n' +
    'CSeq: 22855 ACK\r\n' +
    'Max-Forwards: 70\r\n' +
    'Route: <sip:192.168.60.101:18627;lr>\r\n' +
    'User-Agent: WSS\r\n' +
    'Content-Length: 0\r\n' +
    'Wellcloud_Call_ID: abcd\r\n'+
    '\r\n'

module.exports.msg3 = 'ACK sip:8001@001.com SIP/2.0\r\n' +
    'Via: SIP/2.0/UDP 192.168.60.101:18627;branch=z9hG4bKfee.a8c4d037.0\r\n' +
    'From: "800004" <sip:800004@001.com>;tag=v2Gl2kKLlTNNC.Nydij-ri02clU52sTZ\r\n' +
    'Call-ID: cH.VUFyVvmS5aNUWQtsmgoLylRAEXnMW\r\n' +
    'To: <sip:8001@001.com>;tag=F9vgt16aDKQmD\r\n' +
    'CSeq: 22855 REGISTER\r\n' +
    'Max-Forwards: 70\r\n' +
    'Route: <sip:192.168.60.101:18627;lr>\r\n' +
    'User-Agent: WSS\r\n' +
    'Content-Length: 0\r\n' +
    'Wellcloud_Call_ID: abcd\r\n'+
    '\r\n'