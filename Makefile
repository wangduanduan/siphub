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