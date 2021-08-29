package main

import (
	"net"
	"siphub/pkg/env"
	"siphub/pkg/hep"
	"siphub/pkg/log"
	"time"
)

func main() {
	go CreateUDPServer()

	for {
		time.Sleep(3 * time.Second)
	}
}

func CreateUDPServer() {
	conn, err := net.ListenUDP("udp", &net.UDPAddr{Port: env.Conf.UDPListenPort})
	if err != nil {
		log.Fatalf("Udp Service listen report udp fail:%v", err)
	}
	log.Infof("create udp success")
	defer conn.Close()
	var data = make([]byte,env.Conf.MaxPackgeLength)
	var raw []byte
	for {
		conn.SetDeadline(time.Now().Add(time.Duration(env.Conf.MaxReadTimeoutSeconds) * time.Second))
		n, remoteAddr, err := conn.ReadFromUDP(data)

		if err != nil {
			if opErr, ok := err.(*net.OpError); ok && opErr.Timeout() {
				continue
			} else {
				log.Errorf("read udp error: %v", err)
			}
		}

		raw = make([]byte, n)
		copy(raw, data[:n])
		go HepDecode(raw, remoteAddr)
	}
}

func HepDecode(p []byte, remoteAddr *net.UDPAddr) {
	log.Debugf("%s %v", string(p), remoteAddr)
	hepMsg, err := hep.NewHepMsg(p)

	if err != nil {
		log.Errorf("%+v", err)
		log.Errorf("%s", p)
		return
	}

	log.Infof("%+v", hepMsg)
}
