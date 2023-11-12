version=$(shell cat VERSION)
image_name="wangduanduan/sipgrep-go:$(version)"

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
	-docker rm -f sipgrep-go;
	docker run -d \
	-p 3000:3000 \
	-p 9060:9060/udp \
	-e DBAddr="$(DBAddr)" \
	-e DBName="$(DBName)" \
	-e DBUserPasswd="$(DBUserPasswd)" \
	--name sipgrep-go \
	harbor:5000/wecloud/sipgrep-go:$(image_name)
t1:
	http --verbose localhost:3000/api/v1/call BeginTime=="2023-11-05 00:00:00" EndTime=="2023-11-05 23:59:59"
t2:
	http --verbose localhost:3000/api/v1/call/2023-11-11/oMDfqeY4EHHwovasP2Mn9x3aFzOy6Lvw
t3:
	http --verbose localhost:3000/api/v1/2023-11-12/ccgLi7C.C6PxAqJWT-RrUyWk6MI0BZJq
t4:
	http --verbose localhost:3000/api/v1/call/2023-11-12/25ya3ru5Kx2TJDBrXYMreSlBcsuCLFxL/
