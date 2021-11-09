FROM golang:1.17.2 as builder

ENV GO111MODULE=on GOPROXY=https://goproxy.cn,direct

WORKDIR /app

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o run .

FROM alpine:3.14.2

WORKDIR /app

COPY --from=builder /app/run .
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo
ENV TZ=Asia/Shanghai

EXPOSE 9060/udp
EXPOSE 3000

ENTRYPOINT ["/app/run"]

