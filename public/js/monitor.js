"use strict";

var myChart = echarts.init(document.getElementById('main'));
var data = {
  h_receive: [],
  h_insertdb: [],
  h_drop: [],
  m_INVITE: [],
  m_BYE: [],
  m_CANCEL: [],
  m_ACK: [],
  m_400: [],
  m_404: [],
  m_480: []
}; // 指定图表的配置项和数据

var option = {
  title: {
    text: 'Homer-Lite monitor'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['累计收包', '累计插入', '累计丢弃', 'INVITE请求', 'BYE请求', 'CANCEL请求', 'ACK请求', '400响应', '404响应', '480响应']
  },
  xAxis: {
    type: 'time',
    gridIndex: 0
  },
  yAxis: {
    type: 'value',
    gridIndex: 0
  },
  series: [{
    name: '累计收包',
    type: 'line',
    data: data.h_receive
  }, {
    name: '累计插入',
    type: 'line',
    data: data.h_insertdb
  }, {
    name: '累计丢弃',
    type: 'line',
    data: data.h_drop
  }, {
    name: 'INVITE请求',
    type: 'line',
    data: data.m_INVITE
  }, {
    name: 'BYE请求',
    type: 'line',
    data: data.m_BYE
  }, {
    name: 'CANCEL请求',
    type: 'line',
    data: data.m_CANCEL
  }, {
    name: 'ACK请求',
    type: 'line',
    data: data.m_ACK
  }, {
    name: '400响应',
    type: 'line',
    data: data.m_400
  }, {
    name: '404响应',
    type: 'line',
    data: data.m_404
  }, {
    name: '480响应',
    type: 'line',
    data: data.m_480
  }]
};
dayjs().format('YYYY-MM-DD HH:mm:ss'); // 使用刚指定的配置项和数据显示图表。

myChart.setOption(option);
setInterval(getData, 5000);

function getData() {
  axios.get('/api/stat').then(getDataDone)["catch"](function (err) {
    console.log(err);
  });
}

function getDataDone(res) {
  console.log(res.data);
  Object.keys(res.data).forEach(function (key) {
    if (!data[key]) {
      return;
    }

    data[key].push({
      value: [dayjs().format('YYYY-MM-DD HH:mm:ss'), res.data[key]]
    });
  });
  myChart.setOption(option);
}