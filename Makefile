version=$(shell cat VERSION)
image_name="wangduanduan/sipgrep-go:$(version)"


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

