FROM node:14.15.3-alpine3.11
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories
RUN apk update && apk add bash tzdata curl net-tools && cp -r -f /usr/share/zoneinfo/Asia/Shanghai /etc/localtime


ENV NODE_ENV production

WORKDIR /app


COPY package.json yarn.lock /app/

RUN yarn install --production --registry=https://registry.npm.taobao.org && yarn cache clean

COPY . /app

EXPOSE 3000
EXPOSE 9060

CMD node --experimental-report --report-on-fatalerror --report-uncaught-exception index.js
