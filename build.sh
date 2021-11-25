#!/bin/bash
set -x
set -u

t=$(date +%y.%m.%d)
name="harbor:5000/wecloud/siphub-go:$t"
hub_name="wangduanduan/siphub-go:$t"

docker build . -t $name
echo build success $name
docker push $name
#docker tag $name $hub_name
#docker push $hub_name
