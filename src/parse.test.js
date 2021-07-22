process.env.refuseMethods = ''
const { parse } = require('./parse')
const { msg1, msg2, msg3 } = require('./sip.data')

test('parse response', () => {
  expect(parse(msg1)).toStrictEqual({
    method: '404',
    from: 'sip:800004@001.com',
    to: 'sip:8001@001.com',
    ua: 'WSS',
    cseq: 22855,
    call_id: 'cH.VUFyVvmS5aNUWQtsmgoLylRAEXnMW',
    fs_call_id: '',
    tmMethod: 'INVITE'
  })
})
test('parse request', () => {
  expect(parse(msg2)).toStrictEqual({
    method: 'ACK',
    from: 'sip:800004@001.com',
    to: 'sip:8001@001.com',
    ua: 'WSS',
    cseq: 22855,
    call_id: 'cH.VUFyVvmS5aNUWQtsmgoLylRAEXnMW',
    fs_call_id: 'abcd',
    tmMethod: 'ACK'
  })
})

test('parse register response', () => {
  expect(parse(msg3)).toStrictEqual({
    method: 'REGISTER',
    from: 'sip:1002@192.168.159.12',
    to: 'sip:1002@192.168.159.12',
    ua: 'wellphone/Ver3.0.5',
    cseq: 23477,
    call_id: 'f44177ddd2aa4e078d4bacbd36a25445',
    fs_call_id: '',
    tmMethod: 'REGISTER'
  })
})
