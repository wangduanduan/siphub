const sipUtil  = require('./sip')

const filterMethods = ['REGISTER', 'OPTIONS']

function parse (msg) {
  let headLine = sipUtil.findHeadLine(msg)
  let method = sipUtil.getMethod(headLine)

  if (filterMethods.includes(method)) {
    return {}
  }

  let cseq = sipUtil.getHeadValue(msg, 'CSeq:')

  if (cseq.includes('REGISTER') || cseq.includes('OPTIONS')) {
    return {}
  }

  let from = sipUtil.getHeadBodyUrl(msg, 'From:')
  let to = sipUtil.getHeadBodyUrl(msg, 'To:')
  let call_id = sipUtil.getHeadValue(msg, 'Call-ID:')
  let ua = sipUtil.getHeadValue(msg, 'User-Agent:')
  let fs_call_id = sipUtil.getHeadValue(msg, 'Wellcloud_Call_ID:')

  cseq = parseInt(cseq)

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
