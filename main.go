package main

import (
	// "sipgrep/pkg/env"
	"sipgrep/pkg/hepserver"
	"sipgrep/pkg/log"
	"sipgrep/pkg/mysql"

	// _ "sipgrep/pkg/pg"
	"sipgrep/pkg/route"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/template/html/v2"
	"time"
)

func main() {
	mysql.Connect()

	go mysql.BatchSaveInit()
	go hepserver.CreateHepServer()

	engine := html.New("./views", ".html")
	app := fiber.New(fiber.Config{
		Views: engine,
	})

	app.Static("/", "./public")

	app.Get("/", func(c *fiber.Ctx) error {
		// Render index template
		return c.Render("index", fiber.Map{
			"Title":     "Hello, World!",
			"Today":     time.Now().Format("2006-01-02"),
			"EndTime":   time.Now().Format("15:04:05"),
			"StartTime": time.Now().Add(-time.Minute * 30).Format("15:04:05"),
		})
	})

	api := app.Group("/api")

	v1 := api.Group("/v1")
	v1.Get("/call", route.Search)
	v1.Get("/call/:Day/:SIPCallID/", route.SearchCallID)

	log.Infof("app listen on :3000")
	app.Listen(":3000")
}
