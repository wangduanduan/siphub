package main

import (
	"net"
	"siphub/pkg/env"
	"siphub/pkg/log"
	"siphub/pkg/msg"
	"siphub/pkg/mysql"
	"time"
)

func main() {

	mysql.Connect(env.Conf.DBUserPasswd, env.Conf.DBAddr, env.Conf.DBName)

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
				log.Errorf("read udp error: %v, from %v", err, remoteAddr)
			}
		}

		raw = make([]byte, n)
		copy(raw, data[:n])
		go msg.OnMessage(raw, mysql.Save)
	}

}
