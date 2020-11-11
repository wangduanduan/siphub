var app = new Vue({
  el: '#app',
  data: {
    seq: [],
    pros: {
      '6': 'TCP',
      '17': 'UDP',
      '50': 'ESP'
    }
  },
  methods: {
    fileParse: function (str) {
      try {
        var res = JSON.parse(str)
        this.render({
          data: res
        })
      } catch (error) {
        console.log(error)
        alert('JSON Format Error')
      }
    },
    getProtocol (v) {
      return this.pros[v] ? this.pros[v] : v
    },
    fileChange: function (event) {
      // console.log(files)
      if (event.target.files.length === 0) {
        return
      }
      var reader = new FileReader()
      var me = this
      reader.onload = function (e) {
        console.log(e.target.result)
        me.fileParse(e.target.result)
      }
      reader.readAsText(event.target.files[0])
    },
    render: function (_res) {
      this.seq = _res.data
      console.log(_res)

      let res = []

      this.seq.forEach((item, index) => {
        let v = this.getProtocol(item.protocol)
        let dis = 0
        if (index !== 0) {
          dis = new Date(this.seq[index].time) - new Date(this.seq[index - 1].time)
        }
        dis = dis / 1000
        let na = isNaN(item.method) ? '->' : '-->'
        res.push(`${item.src_host.replace(':', '_')}${na}${item.dst_host.replace(':', '_')}: #${index} ${dayjs(item.time).format('hh:mm:ss')} [${item.method}/${v}] ${dis.toFixed(1)} `)
      })

      this.seq.forEach((item) => {
        item.raw = item.raw.trim()
        item.time = dayjs(item.time).format('hh:mm:ss')
      })

      let seq = res.join('\n')
      $('#seq').html(seq)
      $('#seq').sequenceDiagram({
        theme: 'simple'
      })
    },
    getData: function name (params) {
      let callid = location.search.substr(11)
      let table = location.search.substr(1, 10)

      axios.get('/api/callid?callid=' + callid + '&table=' + table)
        .then(this.render)
        .catch((err) => {
          console.log(err)
        })
    },
    registerEvent: function () {
      $('.signal text').on('click', function (e) {
        console.log(e)
      })
      $('.diagram').on('click', function (e) {
        console.log('dg')
        console.log(e)
        let id = $(e.target).text()

        if (id.startsWith('#')) {
          let key = id.split(' ')[0]
          console.log(key)
          let ele = document.getElementById('raw-' + key)
          ele.scrollIntoView()
        }
      })
    }
  },
  mounted: function (params) {
    // this.getData()
    this.registerEvent()
  }
})
