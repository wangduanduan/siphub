package main

import (
	"net"
	"net/http"
	"siphub/pkg/env"
	"siphub/pkg/log"
	"siphub/pkg/msg"
	"siphub/pkg/mysql"
	"siphub/pkg/prom"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

const MinRawPacketLenth = 105

func main() {
	mysql.Connect(env.Conf.DBUserPasswd, env.Conf.DBAddr, env.Conf.DBName)
	go createHepServer()

	app := http.NewServeMux()

	app.Handle("/metrics", promhttp.Handler())
	log.Infof("app listen on :3000")

	err := http.ListenAndServe(":3000", app)

	if err != nil {
		log.Fatalf("app listen error: %v", err)
	}
}

func createHepServer() {
	conn, err := net.ListenUDP("udp", &net.UDPAddr{Port: env.Conf.UDPListenPort})

	if err != nil {
		log.Fatalf("Udp Service listen report udp fail:%v", err)
	}
	log.Infof("create udp success")

	defer conn.Close()
	var data = make([]byte, env.Conf.MaxPackgeLength)
	var raw []byte
	for {
		conn.SetDeadline(time.Now().Add(time.Duration(env.Conf.MaxReadTimeoutSeconds) * time.Second))
		n, remoteAddr, err := conn.ReadFromUDP(data)

		if err != nil {
			if opErr, ok := err.(*net.OpError); ok && opErr.Timeout() {
				continue
			} else {
				prom.MsgCount.With(prometheus.Labels{"type": "read_udp_error"})
				log.Errorf("read udp error: %v, from %v", err, remoteAddr)
			}
		}

		prom.MsgCount.With(prometheus.Labels{"type": "all_received_packet"}).Inc()

		if n < MinRawPacketLenth {
			prom.MsgCount.With(prometheus.Labels{"type": "raw_byte_too_small"}).Inc()
			log.Warnf("less then MinRawPacketLenth: %d, received length: %d, from: %v", MinRawPacketLenth, n, remoteAddr)
			continue
		}

		raw = make([]byte, n)

		copy(raw, data[:n])

		prom.MsgCount.With(prometheus.Labels{"type": "on_message"}).Inc()

		go msg.OnMessage(raw, mysql.Save)
	}
}
