const sipUtil = require('./sip')
const config = require('config')

const refuseMethods = config.get('refuseMethods')

function parse (msg) {
  const headLine = sipUtil.findHeadLine(msg)
  const method = sipUtil.getMethod(headLine)

  let cseq = sipUtil.getHeadValue(msg, 'CSeq:')
  const cseqMeta = cseq.split(' ')
  let tmMethod = ''

  // read method from cseq
  if (cseqMeta.length === 2) {
    tmMethod = cseqMeta[1]
  }

  if (refuseMethods.includes(tmMethod)) {
    return
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
    tmMethod
  }
}

module.exports = {
  parse
}
