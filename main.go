package main

import (
	"log"
	"net"
	"siphub/config"
	"time"
)

func main() {
	go CreateUDPServer()

	for {
		time.Sleep(3 * time.Second)
	}
}

func CreateUDPServer() {
	conn, err := net.ListenUDP("udp", &net.UDPAddr{Port: config.UDPPort})
	if err != nil {
		log.Fatalf("Udp Service listen report udp fail:%v", err)
	}
	log.Println("create udp success")
	defer conn.Close()
	var data = make([]byte, config.MaxUDPSize)
	var raw []byte
	for {
		conn.SetDeadline(time.Now().Add(config.MaxReadTimeoutSecond))
		n, remoteAddr, err := conn.ReadFromUDP(data)

		if err != nil {
			if opErr, ok := err.(*net.OpError); ok && opErr.Timeout() {
				continue
			} else {
				log.Printf("read udp error: %v", err)
			}
		}

		raw = make([]byte, n)
		copy(raw, data[:n])
		go HepDecode(raw, remoteAddr)
	}
}

func HepDecode(p []byte, remoteAddr *net.UDPAddr) {
	log.Printf("%s %v", string(p), remoteAddr)
}
