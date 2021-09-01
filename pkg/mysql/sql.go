package mysql

import (
	"database/sql"
	"siphub/pkg/log"
)

type Table struct {
	DB *sql.DB
}

func (p *Table) CreateTable(tableDate string) {
	stmtRawTable, err := p.DB.Prepare(RawTable)

	if err != nil {
		if _, err := stmtRawTable.Exec(tableDate); err != nil {
			log.Errorf("create rawTable sip_%s error: %v", tableDate, err)
		} else {
			log.Infof("create rawTable sip_%s success", tableDate)
		}
	} else {
		log.Errorf("Prepare rawTable sip_%s error: %v", err)
	}

	stmtIndexTable, err := p.DB.Prepare(IndexTable)

	if err != nil {
		stmtIndexTable.Exec("2021_02_01")
	} else {

	}
}

func (p *Table) DeleteTable(tableName string) {

}

func (p *Table) CleanTable() {

}
