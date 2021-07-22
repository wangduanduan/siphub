FROM node:14.16.1-alpine3.11 as builder
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories
RUN apk update && apk add bash tzdata curl net-tools && cp -r -f /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
WORKDIR /app
COPY package.json yarn.lock /app/
RUN yarn --registry=https://registry.npm.taobao.org
COPY . /app
RUN yarn test


FROM node:14.16.1-alpine3.11
ENV NODE_ENV production
ENV TZ=Asia/Shanghai

WORKDIR /app
COPY package.json yarn.lock /app/
RUN yarn install --production --registry=https://registry.npm.taobao.org && yarn cache clean
COPY . /app
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo
RUN date

EXPOSE 3000
EXPOSE 9060/udp

CMD node --experimental-report --report-on-fatalerror --report-uncaught-exception index.js
