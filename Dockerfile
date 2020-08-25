FROM node:12.16.0-stretch-slim

ENV NODE_ENV production

WORKDIR /app

RUN echo "export TZ='Asia/Shanghai'" >> /etc/profile \
  && ln -sf /bin/bash /bin/sh

COPY package.json yarn.lock /app/

RUN yarn install --production --registry=https://registry.npm.taobao.org && yarn cache clean

COPY . /app

EXPOSE 3000
EXPOSE 9060

CMD source /etc/profile && node --experimental-report --report-on-fatalerror --report-uncaught-exception index.js