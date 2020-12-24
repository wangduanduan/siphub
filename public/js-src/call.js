var app = new Vue({
  el: '#app',
  data: {
    seq: [],
    raw: '',
    aLegId: '',
    table: '',
    pros: {
      6: 'TCP',
      17: 'UDP',
      50: 'ESP'
    }
  },
  methods: {
    getALegId (raw) {
      const msg = raw.split('\r\n')

      const key = msg.find((item) => {
        return item.startsWith('A-Leg-Id')
      })

      if (key) {
        this.aLegId = '/call?' + this.table + key.split(': ')[1]
      }

      console.log(this.aLegId)
    },
    downloadRawSIP () {
      var downloadFileName = dayjs().format('YYYYMMDD-HHmmss') + '.json'
      var output = this.raw

      if (window.navigator.msSaveBlob) {
        // for ie 10 and later
        try {
          var blobObject = new Blob([output])
          window.navigator.msSaveBlob(blobObject, downloadFileName)
        } catch (e) {
          console.log(e)
        }
      } else {
        var file = 'data:text/plain;charset=utf-8,'
        var logFile = output
        var encoded = encodeURIComponent(logFile)
        file += encoded
        var a = document.createElement('a')
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
      const callid = location.search.substr(11)
      const table = location.search.substr(1, 10)
      this.table = table

      axios.get('/api/callid?callid=' + callid + '&table=' + table)
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
    this.getData()
    this.registerEvent()
  }
})
