build:
	go build -o siphub cmd/main.go
test:
	go test -v ./...
fmt:
	go fmt ./...
changelog:
	git-chglog -o CHANGELOG.md
