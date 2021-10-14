package mysql

import (
	"database/sql"
	"siphub/pkg/log"
	"strings"
	"time"
)

func CreateTable(db *sql.DB, tableDate string) {
	if tableDate == "" {
		tableDate = time.Now().Format("2006_01_02")
	}

	_, err1 := db.Exec(strings.Replace(RawTable, "TABLE_DATE", tableDate, 1))

	if err1 != nil {
		log.Errorf("create rawTable error: %v", err1)
	} else {
		log.Infof("create rawTable success %s", tableDate)
	}

	_, err2 := db.Exec(strings.Replace(IndexTable, "TABLE_DATE", tableDate, 1))

	if err2 != nil {
		log.Errorf("create indexTable error: %v", tableDate, err2)
	} else {
		log.Infof("cteate IndexTable success %s", tableDate)
	}
}

func DeleteTable(tableName string) {

}
