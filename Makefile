t=$(shell date +%y.%m.%d)
name="harbor:5000/wecloud/siphub-go:$t"
hub_name="wangduanduan/siphub-go:$t"

build:
	docker build . -t $(name)
push:
	docker push $(name)
push-hub:
	docker tag $(name) $(hub_name)
	docker push $(hub_name)
test:
	go test -v ./...
fmt:
	go fmt ./...
changelog:
	git-chglog -o CHANGELOG.md
run:
	-docker rm -f hep-server;
	docker run -d \
	-p 3000:3000 \
	-p 9060:9060/udp \
	-e DBAddr="192.168.2.220:3306" \
	-e DBName="siphub" \
	-e DBUserPasswd="root:123456" \
	--name hep-server \
	harbor:5000/wecloud/hep-server:$(t)
