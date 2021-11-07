package main

import (
	"net"
	"siphub/pkg/env"
	"siphub/pkg/log"
	"siphub/pkg/msg"
	"siphub/pkg/mysql"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/template/html"
)

func main() {

	mysql.Connect(env.Conf.DBUserPasswd, env.Conf.DBAddr, env.Conf.DBName)
	go createHepServer()

	engine := html.New("./views", ".html")
	engine.Delims("<%", "%>")
	engine.Reload(true)
	engine.Debug(true)

	app := fiber.New(fiber.Config{Views: engine})

	app.Static("/", "./ui")

	app.Get("/", func(c *fiber.Ctx) error {
		return c.Render("index", fiber.Map{})
	})

	app.Listen(":3000")
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
				log.Errorf("read udp error: %v, from %v", err, remoteAddr)
			}
		}

		raw = make([]byte, n)
		copy(raw, data[:n])
		go msg.OnMessage(raw, mysql.Save)
	}
}
