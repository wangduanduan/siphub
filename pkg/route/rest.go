package route

import (
	"sipgrep/pkg/log"
	"sipgrep/pkg/mysql"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

var validate = validator.New()

func Search(c *fiber.Ctx) error {
	sp := mysql.SearchParams{
		BeginTime:    c.Query("BeginTime"),
		EndTime:      c.Query("EndTime"),
		Caller:       c.Query("Caller"),
		CallerDomain: c.Query("CallerDomain"),
		Callee:       c.Query("Callee"),
		CalleeDomain: c.Query("CalleeDomain"),
	}

	log.Infof("%#v", sp)

	if err := validate.Struct(sp); err != nil {
		log.Errorf("%v", err)
		return &fiber.Error{
			Code:    fiber.ErrBadRequest.Code,
			Message: "query string error",
		}
	}

	sql := mysql.GetSearchSql(sp)

	log.Infof("sql %s", sql)

	table, err := mysql.Search(sql)

	if err != nil {
		log.Errorf("%v", err)
		return &fiber.Error{
			Code:    fiber.ErrInternalServerError.Code,
			Message: "sql query error",
		}
	}

	return c.JSON(table)
}
