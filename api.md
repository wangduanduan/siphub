# http api 介绍

## 根据sip-callID查fs-callID

`GET /api/fs-callid?sipCallId=${sipCallId}&day=${day}`

**query参数**
- sipCallId: sipCallId；必传
- day: 日期；格式：YYYY_MM_DD；可选；默认为当天

**异常状态码**
- 400 请求参数不规范
- 404 未找到fs CallID

**请求demo**
```
curl 'http://localhost:3000/api/fs-callid?day=2020_08_26&sipCallId=010e3459-6209-1239-f2a3-00505695faa6'

200 Ok

{"fs_callid":"abc"}
```