push:
	yarn build;
	git add -A;
	git commit -am "字体调整到14px";
	git push;
run-sip-hub:
	docker run -d -p 3000:3000 -p 9060:9060/udp \
	--log-opt size=10M \
	--log-opt maxfile=3 \
	--env NODE_ENV=production \
	--env dbHost=192.168.60.132 \
	--env dbUser=root \
	--env dbPwd=wellcloud \
	--env dbName=sip_homer \
	--env dataKeepDays=7 \
	--name sip-hub registry:5000/wecloud/sip-hub:0.0.0-12