const sipUtil = require('./sip')

const filterMethods = ['REGISTER', 'OPTIONS']

function parse (msg) {
  const headLine = sipUtil.findHeadLine(msg)
  const method = sipUtil.getMethod(headLine)

  let statusCode = parseInt(method) || 0

  if (filterMethods.includes(method)) {
    return {}
  }

  let cseq = sipUtil.getHeadValue(msg, 'CSeq:')

  if (cseq.includes('REGISTER') || cseq.includes('OPTIONS')) {
    return {}
  }

  if (!cseq.includes('INVITE')) {
    statusCode = 0
  }

  const from = sipUtil.getHeadBodyUrl(msg, 'From:')
  const to = sipUtil.getHeadBodyUrl(msg, 'To:')
  const call_id = sipUtil.getHeadValue(msg, 'Call-ID:')
  const ua = sipUtil.getHeadValue(msg, 'User-Agent:')
  const fs_call_id = sipUtil.getHeadValue(msg, 'Wellcloud_Call_ID:')

  cseq = parseInt(cseq)

  return {
    method,
    from,
    to,
    ua,
    cseq,
    call_id,
    fs_call_id,
    statusCode
  }
}

module.exports = {
  parse
}
