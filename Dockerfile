FROM node:22-alpine3.19
# RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories
RUN apk update && apk add tzdata curl && cp -r -f /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

ENV NODE_ENV production

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml /app/

RUN pnpm i -P

COPY . /app

EXPOSE 3000

CMD [ "node", "app.mjs" ]