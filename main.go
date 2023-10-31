package main

import (
	"sipgrep/pkg/env"
	"sipgrep/pkg/hepserver"
	"sipgrep/pkg/log"
	"sipgrep/pkg/mysql"
	"sipgrep/pkg/route"

	"github.com/gofiber/fiber/v2"
)

func main() {
	mysql.Connect(env.Conf.DBUser+":"+env.Conf.DBPasswd, env.Conf.DBAddr, env.Conf.DBName)

	go mysql.BatchSaveInit()
	go hepserver.CreateHepServer()

	app := fiber.New()

	api := app.Group("/api")

	v1 := api.Group("/v1")
	v1.Get("/call", route.Search)

	log.Infof("app listen on :3000")
	app.Listen(":3000")
}
