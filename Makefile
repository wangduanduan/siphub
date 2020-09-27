group?=parse
push:
	git add -A;
	git commit -am "00";
	git push;
.PHONY: tags
tags:
	ctags -R;
test:
	yarn jest --testNamePattern=$(group) --verbose
ab:
	ab -c 10 -n 100000 "http://localhost:3000/api/search?method=INVITE&beginTime=2020-09-25%2018:31:22&endTime=2020-09-25%2019:36:22&shortTime=5"

changelog:
	git log --pretty=format:"[%h] %s" | grep ":" | sort -k2,2 > changelog.md