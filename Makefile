t=$(shell date +%y.%m.%d)

build:
	go build -o siphub main.go
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
	-p 9090:9090/udp \
	-e DBAddr="192.168.2.220:3306" \
	-e DBName="siphub" \
	-e DBUserPasswd="root:123456" \
	--name hep-server \
	harbor:5000/wecloud/hep-server:$(t)
