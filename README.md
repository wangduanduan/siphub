# 功能介绍
sip-hub是一个sip消息的搜索以及时序图可视化展示的服务，相比于Homer, sip-hub做了大量的功能简化。同时也提供了一些个性化的查询，例如被叫后缀查询，仅域名查询等等。

sip-hub服务仅有3个页面

- sip消息搜索页面，用于按照主被叫、域名和时间范围搜索呼叫记录
- 时序图展示页面，用于展示SIP时序图和原始SIP消息
- 可以导入导出SIP消息
- 可以查找A-Leg
- 监控功能

# 相关截图

![](./docs/search.jpg)
![](./docs/sips.jpg)



# 安装
1. 首先需要安装MySql数据库，并在其中建立一个名为siphub的数据库
2. 运行

```sh
	docker run -d -p 3000:3000 -p 9060:9060/udp \
	--env NODE_ENV=production \
	--env dbHost=mysql \
	--env dbUser=root \
	--env dbPwd=123456 \
	--env dbName=siphub \
	--env dataKeepDays=3 \
	--name siphub wangduanduan/siphub
```