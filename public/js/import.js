"use strict";

var app = new Vue({
  el: '#app',
  data: {
    seq: []
  },
  methods: {
    fileParse: function fileParse(str) {
      try {
        var res = JSON.parse(str);
        this.render({
          data: res
        });
      } catch (error) {
        console.log(error);
        alert('JSON Format Error');
      }
    },
    fileChange: function fileChange(event) {
      // console.log(files)
      if (event.target.files.length === 0) {
        return;
      }

      var reader = new FileReader();
      var me = this;

      reader.onload = function (e) {
        console.log(e.target.result);
        me.fileParse(e.target.result);
      };

      reader.readAsText(event.target.files[0]);
    },
    render: function render(_res) {
      this.seq = _res.data;
      var res = [];
      this.seq.forEach(function (item, index) {
        var na = isNaN(item.method) ? '->' : '-->';
        res.push("".concat(item.src_host.replace(':', '_')).concat(na).concat(item.dst_host.replace(':', '_'), ": #").concat(index, " [").concat(item.method, "] ").concat(dayjs(item.time).format('mm:ss')));
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
    getData: function name(params) {
      var callid = location.search.substr(11);
      var table = location.search.substr(1, 10);
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
    // this.getData()
    this.registerEvent();
  }
});