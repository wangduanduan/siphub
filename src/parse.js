const sipUtil = require('./sip')
const config = require('config')

const refuseMethods = config.get('refuseMethods')
const uidName = config.get('uidName')

function parse (msg) {
  const headLine = sipUtil.findHeadLine(msg)
  const method = sipUtil.getMethod(headLine)

  let cseq = sipUtil.getHeadValue(msg, 'CSeq:')
  const cseqMeta = cseq.split(' ')
  let tmMethod = ''
  let uidValue = ''

  // read method from cseq
  if (cseqMeta.length === 2) {
    tmMethod = cseqMeta[1]
  }

  if (refuseMethods.includes(tmMethod)) {
    return
  }

  const from = sipUtil.getHeadBodyUrl(msg, 'From:')
  let to = ''

  if (method === 'INVITE') {
    to = sipUtil.getRequestURL(headLine)
  } else {
    to = sipUtil.getHeadBodyUrl(msg, 'To:')
  }

  const call_id = sipUtil.getHeadValue(msg, 'Call-ID:')
  const ua = sipUtil.getHeadValue(msg, 'User-Agent:')
  const fs_call_id = sipUtil.getHeadValue(msg, 'Wellcloud_Call_ID:')

  if (uidName) {
    uidValue = sipUtil.getHeadValue(msg, uidName + ':')
  }

  cseq = parseInt(cseq)

  return {
    method,
    from,
    to,
    ua,
    cseq,
    call_id,
    fs_call_id,
    tmMethod,
    u_id: uidValue
  }
}

module.exports = {
  parse
}
