# siphub功能介绍


# 截图

**搜索页面展示**
![](docs/img/search.jpg)

**时序图展示页面**
![](docs/img/flow.jpg)



# Roadmap

- [x] 时序图搜索
- [x] 时序图展示
- [ ] 分表
- [ ] 数据保留日期设置
- [ ] 收藏
- [ ] 导入pcap
- [ ] 导入json
- [ ] 导出json
- [ ] AB Call-leg关联

## 依赖

- PostgreSQL 16

# 部署

## docker 部署

```shell
docker run -d --name=siphub \
    -e DBUser=root \
    -e DBPasswd=mypass \
    -e DBAddr=1.2.3.4 \
    -e DBPort=5432 \
    -e DBName=postgres \
    -p 3000:3000 \
    eddiemurphy5/siphub:latest
```

**启动环境变量说明**

- DBUser: 数据库用户名， 默认wangduanduan
- DBPasswd: 数据库密码
- DBAddr: 数据库地址，默认127.0.0.1
- DBPort: 数据库端口，默认5432,
- DBName: 数据库名，默认postgres,
- LogLevel: 日志级别, 默认debug
- QueryLimit: 一次性查询的行数，默认10


# 架构图

- OpenSIPS、FreeSWITCH、Heplify 将SIP消息以HEP格式写入到hep-connect
- hep-connect将消息写入数据库， hep-connect部署文档参考 https://github.com/wangduanduan/hep-connect 
- siphub提供web查询界面，负责从数据库查询和展示SIP消息

![](docs/img/arch.jpg)