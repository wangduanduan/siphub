version=$(shell cat VERSION)
image_name="wangduanduan/sipgrep-go:$(version)"

DBAddr=
DBName=
DBUserPasswd=

dev:
	watchexec -r -e mjs -- bun app.mjs
dev1:
	watchexec -r -e mjs -- node app.mjs
image-build:
	docker build . -t $(image_name)
image-push:
	docker push $(image_name)
release:
	git tag v$(version)
	git push origin v$(version)
changelog:
	git-chglog -o CHANGELOG.md
t1:
	http --verbose localhost:3000/api/v1/call BeginTime=="2023-11-05 00:00:00" EndTime=="2023-11-05 23:59:59"
t2:
	http --verbose localhost:3000/api/v1/call/2023-11-11/oMDfqeY4EHHwovasP2Mn9x3aFzOy6Lvw
t3:
	http --verbose localhost:3000/api/v1/2023-11-12/ccgLi7C.C6PxAqJWT-RrUyWk6MI0BZJq
t4:
	http --verbose localhost:3000/api/v1/call/2023-11-12/25ya3ru5Kx2TJDBrXYMreSlBcsuCLFxL/
