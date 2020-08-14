push:
	git add -A;
	git commit -am "00";
	git push;
.PHONY: tags
tags:
	ctags -R;
