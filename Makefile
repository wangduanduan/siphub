version=$(shell cat VERSION)
image_name="wangduanduan/siphub-go:$(version)"

DBAddr=
DBName=
DBUserPasswd=

go:
	go build -o run .
gofmt:
	gofmt -l -w .
image-build:
	docker build . -t $(image_name)
image-push:
	docker push $(image_name)
release:
	git tag v$(version)
	git push origin v$(version)
test:
	go test -v ./...
fmt:
	go fmt ./...
changelog:
	git-chglog -o CHANGELOG.md
run:
	-docker rm -f siphub-go;
	docker run -d \
	-p 3000:3000 \
	-p 9060:9060/udp \
	-e DBAddr="$(DBAddr)" \
	-e DBName="$(DBName)" \
	-e DBUserPasswd="$(DBUserPasswd)" \
	--name siphub-go \
	harbor:5000/wecloud/siphub-go:$(image_name)
