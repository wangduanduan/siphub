# create db sql
# create database `siphub` default character set utf8mb4 collate utf8mb4_unicode_ci
# 
network:
  docker network create -d bridge \
  --ip-range=192.168.1.0/24 \
  --gateway=192.168.1.1 --subnet=192.168.1.0/24 sip
mysql:
	docker run --name mysql \
	-e MYSQL_ROOT_PASSWORD=123456 -d \
  	-p 3306:3306 \
  	-v /my/own/datadir:/var/lib/mysql \
  	--network sip \
  	registry:5000/wecloud/mysql:5.7-1 \
  	--sql-mode=""
siphub:
	docker run -d -p 3000:3000 -p 9060:9060/udp \
    --network sip \
	--env NODE_ENV=production \
	--env dbHost=mysql \
	--env dbUser=root \
	--env dbPwd=123456 \
	--env dbName=siphub \
	--env dataKeepDays=3 \
	--name sip-hub registry:5000/wecloud/sip-hub:0.0.0-35
restart:
	-docker rm -f sip-hub;
	make run-sip-hub;