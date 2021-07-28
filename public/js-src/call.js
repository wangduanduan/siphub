/* global Qs location, dayjs, Vue, Blob */
const app = new Vue({
  el: '#app',
  data: {
    seq: [],
    raw: '',
    aLegId: '',
    callid: '',
    uid: '',
    table: '',
    pros: {
      6: 'TCP',
      17: 'UDP',
      50: 'ESP'
    }
  },
  methods: {
    queryString () {
      const qs = Qs.parse(location.search, { ignoreQueryPrefix: true })
      this.table = qs.table
      this.callid = qs.callid
      this.uid = qs.uid
    },
    getALegId (raw) {
      const msg = raw.split('\r\n')

      const key = msg.find((item) => {
        return item.startsWith('A-Leg-Id')
      })

      if (key) {
        this.aLegId = `/call?table=${this.table}&callid=${key.split(': ')[1]}&uid=${this.uid}`
      } else {
        axios.get('/api/other-leg?callid=' + this.callid + '&table=' + this.table + '&uid=' + this.uid)
          .then((res) => {
            console.log(res.data)
            this.aLegId = `/call?table=${this.table}&callid=${res.data[0].callid}&uid=${this.uid}`
          })
          .catch((err) => {
            console.log(err)
          })
      }
      console.log(this.aLegId)
    },
    downloadRawSIP () {
      const downloadFileName = dayjs().format('YYYYMMDD-HHmmss') + '.json'
      const output = this.raw

      if (window.navigator.msSaveBlob) {
        // for ie 10 and later
        try {
          const blobObject = new Blob([output])
          window.navigator.msSaveBlob(blobObject, downloadFileName)
        } catch (e) {
          console.log(e)
        }
      } else {
        let file = 'data:text/plain;charset=utf-8,'
        const logFile = output
        const encoded = encodeURIComponent(logFile)
        file += encoded
        const a = document.createElement('a')
        a.href = file
        a.target = '_blank'
        a.download = downloadFileName
        document.body.appendChild(a)
        a.click()
        a.remove()
      }
    },
    getProtocol (v) {
      return this.pros[v] ? this.pros[v] : v
    },
    render (_res) {
      this.seq = _res.data
      this.raw = JSON.stringify(_res.data)

      const res = []

      this.seq.forEach((item, index) => {
        if (item.method === 'INVITE') {
          this.getALegId(item.raw)
        }
        const na = isNaN(item.method) ? '->' : '-->'
        const v = this.getProtocol(item.protocol)
        let dis = 0
        if (index !== 0) {
          dis = new Date(this.seq[index].time) - new Date(this.seq[index - 1].time)
        }
        item.timeH = dayjs(item.time).format('hh:mm:ss')
        dis = dis / 1000
        res.push(`${item.src_host.replace(':', '_')}${na}${item.dst_host.replace(':', '_')}: #${index} ${item.timeH} [${item.method}/${v}] ${dis.toFixed(1)}`)
      })

      this.seq.forEach((item) => {
        item.raw = item.raw.trim()
        item.time = dayjs(item.time).format('hh:mm:ss')
      })

      const seq = res.join('\n')
      $('#seq').html(seq)
      $('#seq').sequenceDiagram({ theme: 'simple' })
    },
    getData (params) {
      axios.get('/api/callid?callid=' + this.callid + '&table=' + this.table)
        .then(this.render)
        .catch((err) => {
          console.log(err)
        })
    },
    registerEvent () {
      $('.signal text').on('click', function (e) {
        console.log(e)
      })
      $('.diagram').on('click', function (e) {
        console.log('dg')
        console.log(e)
        const id = $(e.target).text()

        if (id.startsWith('#')) {
          const key = id.split(' ')[0]
          console.log(key)
          const ele = document.getElementById('raw-' + key)
          ele.scrollIntoView()
        }
      })
    }
  },
  mounted (params) {
    this.queryString()
    this.getData()
    this.registerEvent()
  }
})
