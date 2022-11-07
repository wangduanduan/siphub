package api

import (
	"strings"

	"siphub/pkg/log"

	"github.com/gofiber/fiber/v2"
)

// from
// to
// beginTime
// endTime
func Search(c *fiber.Ctx) {
	paramsFromUser := c.Query("from")
	paramsFromDomain := ""

	if strings.Contains(paramsFromUser, "@") {
		tmp := strings.SplitN(paramsFromUser, "@", 2)

		if len(tmp) == 2 {
			paramsFromUser = tmp[0]
			paramsFromDomain = tmp[1]
		}
	}

	log.Infof("paramsFromUser: %s, paramsFromDomain: %s", paramsFromUser, paramsFromDomain)

	paramsToUser := c.Query("to")
	paramsToDomain := ""

	if strings.Contains(paramsToUser, "@") {
		tmp := strings.SplitN(paramsToUser, "@", 2)

		if len(tmp) == 2 {
			paramsToUser = tmp[0]
			paramsToDomain = tmp[1]
		}
	}

	log.Infof("paramsToUser: %s, paramsToDomain: %s", paramsToUser, paramsToDomain)

	paramsBeginTime := c.Query("beginTime")
	paramsEndTime := c.Query("endTime")

	log.Infof("paramsBeginTime: %s, paramsEndTime: %s", paramsBeginTime, paramsEndTime)
}
