package hepserver

import (
	"fmt"
	"net"
	"sipgrep/pkg/env"
	"sipgrep/pkg/log"
	"sipgrep/pkg/msg"
	"sipgrep/pkg/mysql"
	"sipgrep/pkg/prom"
	"time"

	"github.com/prometheus/client_golang/prometheus"
)

const MinRawPacketLength = 105

func main() {
	fmt.Println("vim-go")
}

func CreateHepServer() {
	conn, err := net.ListenUDP("udp", &net.UDPAddr{Port: env.Conf.UDPListenPort})

	if err != nil {
		log.Fatalf("Udp Service listen report udp fail:%v", err)
	}
	log.Infof("create udp success")

	defer conn.Close()
	var data = make([]byte, env.Conf.MaxPacketLength)
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

		if n < MinRawPacketLength {
			prom.MsgCount.With(prometheus.Labels{"type": "raw_byte_too_small"}).Inc()
			log.Warnf("less then MinRawPacketLength: %d, received length: %d, from: %v", MinRawPacketLength, n, remoteAddr)
			continue
		}

		raw = make([]byte, n)

		copy(raw, data[:n])

		prom.MsgCount.With(prometheus.Labels{"type": "on_message"}).Inc()

		go msg.OnMessage(raw, mysql.Save, remoteAddr.IP)
	}
}
