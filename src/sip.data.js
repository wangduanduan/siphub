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

module.exports.msg3 = 'REGISTER sip:192.168.159.12:5060 SIP/2.0\r\n'+
'Via: SIP/2.0/UDP 192.168.159.1:62853;rport;branch=z9hG4bKPjcb8e3a2586b740e5ac3845d5b6d42926\r\n'+
'Route: <sip:192.168.159.12:5060;lr>\r\n'+
'Max-Forwards: 70\r\n'+
'From: <sip:1002@192.168.159.12>;tag=feffa1b1ce68471d8e0a97eb9a1dcb32\r\n'+
'To: <sip:1002@192.168.159.12>\r\n'+
'Call-ID: f44177ddd2aa4e078d4bacbd36a25445\r\n'+
'CSeq: 23477 REGISTER\r\n'+
'User-Agent: wellphone/Ver3.0.5\r\n'+
'Contact: <sip:1002@192.168.159.1:62853;ob>\r\n'+
'Expires: 300\r\n'+
'Allow: PRACK, INVITE, ACK, BYE, CANCEL, UPDATE, INFO, SUBSCRIBE, NOTIFY, REFER, MESSAGE, OPTIONS\r\n'+
'Content-Length:  0\r\n'+
'\r\n'