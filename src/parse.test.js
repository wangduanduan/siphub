const {parse} = require('./parse')
const {msg1, msg2, msg3} = require('./sip.data')


test('parse response', () => {
    expect(parse(msg1)).toStrictEqual({
        method: '404',
        from: 'sip:800004@001.com',
        to: 'sip:8001@001.com',
        ua: 'WSS',
        cseq: 22855,
        call_id: 'cH.VUFyVvmS5aNUWQtsmgoLylRAEXnMW',
        fs_call_id: ''
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
        fs_call_id: 'abcd'
    })
})

test('parse register response', () => {
    expect(parse(msg3)).toStrictEqual({})
})