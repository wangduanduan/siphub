package mysql

import (
    "database/sql"
    "siphub/pkg/models"
)


type Record struct {
    DB *sql.DB
}


func (p *Record) Save (m *models.SIP) (int, error) {

    return 0, nil
}
