const {
    eatToken,
    findHeadLine,
    isRequest,
    isResponse,
    getMethod,
    getHeadValue,
    getBodyUrl,
    getHeadBodyUrl
} = require('./sip')
const {msg1, msg2} = require('./sip.data')

test('sip eatToken', () => {
    expect(eatToken(msg1,'From:')).toBe('From: "800004" <sip:800004@001.com>;tag=v2Gl2kKLlTNNC.Nydij-ri02clU52sTZ')
    expect(eatToken(msg1,'Call-ID:')).toBe('Call-ID: cH.VUFyVvmS5aNUWQtsmgoLylRAEXnMW')
    expect(eatToken(msg1,'CSeq:')).toBe('CSeq: 22855 INVITE')
    expect(eatToken('CSeq:')).toBe('')
    expect(eatToken(msg1,'BadHEAD:')).toBe('')
})

test('sip findHeadLine', () => {
    expect(findHeadLine(msg1)).toBe('SIP/2.0 404 Not Found')
    expect(findHeadLine(msg2)).toBe('ACK sip:8001@001.com SIP/2.0')
})

test('sip isRequest', () => {
    expect(isRequest('ACK sip:8001@001.com SIP/2.0')).toBe(true)
    expect(isRequest('SIP/2.0 404 Not Found')).toBe(false)
    expect(isRequest('')).toBe(false)
})

test('sip isResponse', () => {
    expect(isResponse('ACK sip:8001@001.com SIP/2.0')).toBe(false)
    expect(isResponse('SIP/2.0 404 Not Found')).toBe(true)
    expect(isResponse('')).toBe(false)
})

test('sip getMethod', () => {
    expect(getMethod('ACK sip:8001@001.com SIP/2.0')).toBe('ACK')
    expect(getMethod('SIP/2.0 404 Not Found')).toBe('404')
    expect(getMethod('')).toBe('')
})

test('sip getHeadValue', () => {
    expect(getHeadValue(msg1, 'From:')).toBe('"800004" <sip:800004@001.com>;tag=v2Gl2kKLlTNNC.Nydij-ri02clU52sTZ')
    expect(getHeadValue(msg1, 'User-Agent:')).toBe('WSS')
})

test('sip getBodyUrl', () => {
    expect(getBodyUrl('"Bob" <sips:bob@biloxi.com> ;tag=a48s')).toBe('sips:bob@biloxi.com')
    expect(getBodyUrl('sip:+12125551212@phone2net.com;tag=887s')).toBe('sip:+12125551212@phone2net.com;tag=887s')
    expect(getBodyUrl('Anonymous <sip:c8oqz84zk7z@privacy.org>;tag=hyh8')).toBe('sip:c8oqz84zk7z@privacy.org')
})

test('sip getHeadBodyUrl', () => {
    expect(getHeadBodyUrl(msg1, 'From:')).toBe('sip:800004@001.com')
    expect(getHeadBodyUrl(msg1, 'To:')).toBe('sip:8001@001.com')
})