"use strict";

/* global Qs location, dayjs, Vue, Blob */
var app = new Vue({
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
    queryString: function queryString() {
      var qs = Qs.parse(location.search, {
        ignoreQueryPrefix: true
      });
      this.table = qs.table;
      this.callid = qs.callid;
      this.uid = qs.uid;
    },
    getALegId: function getALegId(raw) {
      var _this = this;

      var msg = raw.split('\r\n');
      var key = msg.find(function (item) {
        return item.startsWith('A-Leg-Id');
      });

      if (key) {
        this.aLegId = "/call?table=".concat(this.table, "&callid=").concat(key.split(': ')[1], "&uid=").concat(this.uid);
      } else {
        axios.get('/api/other-leg?callid=' + this.callid + '&table=' + this.table + '&uid=' + this.uid).then(function (res) {
          console.log(res.data);
          _this.aLegId = "/call?table=".concat(_this.table, "&callid=").concat(res.data[0].callid, "&uid=").concat(_this.uid);
        })["catch"](function (err) {
          console.log(err);
        });
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
      var _this2 = this;

      this.seq = _res.data;
      this.raw = JSON.stringify(_res.data);
      var res = [];
      this.seq.forEach(function (item, index) {
        if (item.method === 'INVITE') {
          _this2.getALegId(item.raw);
        }

        var na = isNaN(item.method) ? '->' : '-->';

        var v = _this2.getProtocol(item.protocol);

        var dis = 0;

        if (index !== 0) {
          dis = new Date(_this2.seq[index].time) - new Date(_this2.seq[index - 1].time);
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
      axios.get('/api/callid?callid=' + this.callid + '&table=' + this.table).then(this.render)["catch"](function (err) {
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
    this.queryString();
    this.getData();
    this.registerEvent();
  }
});