"use strict";

/* global Vue, dayjs, $, alert, axios */
var app = new Vue({
  el: '#app',
  data: {
    list: [],
    from: '',
    to: '',
    method: 'INVITE',
    beginTime: dayjs().subtract(5, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    endTime: dayjs().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    shortTime: 10,
    loading: false
  },
  methods: {
    changeTime: function changeTime() {
      if (this.shortTime === 0) {
        this.endTime = '';
        this.beginTime = '';
        return;
      }

      this.endTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
      this.beginTime = dayjs().subtract(this.shortTime, 'minute').format('YYYY-MM-DD HH:mm:ss');
    },
    render: function render(res) {
      this.loading = false;
      res.data.forEach(function (item) {
        item.time = dayjs(item.time).format('YYYY-MM-DD HH:mm:ss');
        item.table = dayjs(item.time).format('YYYY_MM_DD');
      });
      this.list = res.data;
    },
    getQuery: function getQuery() {
      var re = [];

      if (!this.method) {
        this.method = 'INVITE';
      }

      this.method = this.method.toUpperCase();
      re.push('method=' + this.method);

      if (this.from) {
        re.push('from=' + this.from);
      }

      if (this.to) {
        re.push('to=' + this.to);
      }

      if (this.beginTime) {
        re.push('beginTime=' + this.beginTime);
      }

      if (this.endTime) {
        re.push('endTime=' + this.endTime);
      }

      if (this.shortTime) {
        re.push('shortTime=' + this.shortTime);
      }

      return re.join('&');
    },
    checkTime: function checkTime(params) {
      var re = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

      if (!re.test(this.beginTime)) {
        alert('Start Time Format Error');
        return false;
      }

      if (!re.test(this.endTime)) {
        alert('End Time Format Error');
        return false;
      }

      if (dayjs(this.beginTime).format('MMDD') !== dayjs(this.endTime).format('MMDD')) {
        alert('Start Time and End time must be in same day');
        return false;
      }

      return true;
    },
    getData: function name() {
      var _this = this;

      if (!this.checkTime()) {
        return;
      }

      this.loading = true;
      this.list = [];
      axios.get('/api/search?' + this.getQuery()).then(this.render)["catch"](function (err) {
        _this.loading = false;
        console.log(err);
      });
    }
  },
  mounted: function mounted() {
    this.getData();
  },
  filters: {
    transProtocol: function transProtocol(v) {
      var protocols = {
        '17': 'UDP',
        '6': 'TCP',
        '50': 'ESP'
      };
      return protocols[v] ? protocols[v] : v;
    }
  }
});