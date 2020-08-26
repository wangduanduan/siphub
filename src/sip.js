const endFlag = '\r\n'

function isString (s) {
    return typeof s === 'string'
}

function isNotString (s) {
    return typeof s !== 'string'
}

function isEmpty(s){
    return s === ''
}

function eatToken(raw, token){
    if (isNotString(raw) || isNotString(token)) return ''

    if (isEmpty(raw) || isEmpty(token)) return ''

    let startIndex = raw.indexOf(token)

    if (startIndex === -1) return ''

    let endIndex = raw.indexOf(endFlag, startIndex)

    if (endIndex === -1) return ''

    return raw.substring(startIndex, endIndex)
}

function findHeadLine (raw) {
    if (isNotString(raw) || isEmpty(raw)) return ''
    let endIndex = raw.indexOf(endFlag)
    if (endIndex === -1) return ''
    return raw.substring(0, endIndex)
}

function isRequest (headLine) {
    if (isNotString(headLine) || isEmpty(headLine)) return false
    
    return !headLine.startsWith('SIP')
}

function isResponse (headLine) {
    if (isNotString(headLine) || isEmpty(headLine)) return false
    return headLine.startsWith('SIP')
}

function getMethod (headLine) {
    if (isNotString(headLine) || isEmpty(headLine)) return ''

    let meta = headLine.split(' ')

    if (meta.length < 2) return ''

    return isRequest(headLine) ? meta[0]: meta[1]
}

function getHeadValue (raw, token) {
    let v = eatToken(raw, token)

    if (isEmpty(v)) return ''

    return v.substring(token.length, v.length).trim()
}

function getHeadBodyUrl (raw, token) {
    let v = getHeadValue(raw, token)
    return getBodyUrl(v)
}

function getBodyUrl (headValue) {
    if (isEmpty(headValue)) return ''

    let startIndex = headValue.indexOf('<')

    if (startIndex === -1) {
        return headValue
    }

    let endIndex = headValue.indexOf('>')
    if (endIndex === -1) return ''

    return headValue.substring(startIndex+1,endIndex)
}

module.exports = {
    eatToken,
    findHeadLine,
    isRequest,
    isResponse,
    getMethod,
    getHeadValue,
    getBodyUrl,
    getHeadBodyUrl
}