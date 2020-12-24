"use strict";

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
    getALegId: function getALegId(raw) {
      var msg = raw.split('\r\n');
      var key = msg.find(function (item) {
        return item.startsWith('A-Leg-Id');
      });

      if (key) {
        this.aLegId = '/call?' + this.table + key.split(': ')[1];
      }

      console.log(this.aLegId);
    },
    downloadRawSIP: function downloadRawSIP() {
      var downloadFileName = dayjs().format('YYYYMMDD-HHmmss') + '.json';
      var output = this.raw;

      if (window.navigator.msSaveBlob) {
        // for ie 10 and later
        try {
          var blobObject = new Blob([output]);
          window.navigator.msSaveBlob(blobObject, downloadFileName);
        } catch (e) {
          console.log(e);
        }
      } else {
        var file = 'data:text/plain;charset=utf-8,';
        var logFile = output;
        var encoded = encodeURIComponent(logFile);
        file += encoded;
        var a = document.createElement('a');
        a.href = file;
        a.target = '_blank';
        a.download = downloadFileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    },
    getProtocol: function getProtocol(v) {
      return this.pros[v] ? this.pros[v] : v;
    },
    render: function render(_res) {
      var _this = this;

      this.seq = _res.data;
      this.raw = JSON.stringify(_res.data);
      var res = [];
      this.seq.forEach(function (item, index) {
        if (item.method === 'INVITE') {
          _this.getALegId(item.raw);
        }

        var na = isNaN(item.method) ? '->' : '-->';

        var v = _this.getProtocol(item.protocol);

        var dis = 0;

        if (index !== 0) {
          dis = new Date(_this.seq[index].time) - new Date(_this.seq[index - 1].time);
        }

        item.timeH = dayjs(item.time).format('hh:mm:ss');
        dis = dis / 1000;
        res.push("".concat(item.src_host.replace(':', '_')).concat(na).concat(item.dst_host.replace(':', '_'), ": #").concat(index, " ").concat(item.timeH, " [").concat(item.method, "/").concat(v, "] ").concat(dis.toFixed(1)));
      });
      this.seq.forEach(function (item) {
        item.raw = item.raw.trim();
        item.time = dayjs(item.time).format('hh:mm:ss');
      });
      var seq = res.join('\n');
      $('#seq').html(seq);
      $('#seq').sequenceDiagram({
        theme: 'simple'
      });
    },
    getData: function getData(params) {
      var callid = location.search.substr(11);
      var table = location.search.substr(1, 10);
      this.table = table;
      axios.get('/api/callid?callid=' + callid + '&table=' + table).then(this.render)["catch"](function (err) {
        console.log(err);
      });
    },
    registerEvent: function registerEvent() {
      $('.signal text').on('click', function (e) {
        console.log(e);
      });
      $('.diagram').on('click', function (e) {
        console.log('dg');
        console.log(e);
        var id = $(e.target).text();

        if (id.startsWith('#')) {
          var key = id.split(' ')[0];
          console.log(key);
          var ele = document.getElementById('raw-' + key);
          ele.scrollIntoView();
        }
      });
    }
  },
  mounted: function mounted(params) {
    this.getData();
    this.registerEvent();
  }
});