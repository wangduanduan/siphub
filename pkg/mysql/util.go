package mysql

import (
	"fmt"
	"sipgrep/pkg/env"
	"strings"

	"github.com/golang-module/carbon/v2"
)

var SearchFields = []string{
	"sip_callid",
	"create_time",
	"from_user",
	"from_host",
	"to_user",
	"to_host",
	"user_agent",
	"sip_protocol",
	"sip_method",
	"cseq_method",
	"fs_callid",
	"leg_uid",
	"count(*) as msg_count",
}

type SearchParams struct {
	BeginTime    string `validate:"required,datetime=2006-01-02 15:04:05,len=19"`
	EndTime      string `validate:"required,datetime=2006-01-02 15:04:05,len=19"`
	Caller       string `validate:"max=64"`
	CallerDomain string `validate:"max=64"`
	Callee       string `validate:"max=64"`
	CalleeDomain string `validate:"max=64"`
}

func GetTableName(BeginTime string) string {
	if carbon.Parse(BeginTime).IsToday() {
		return "records"
	}

	// YYYYMMDD
	newTable := carbon.Parse(BeginTime).ToShortDateString()

	return "sipgrep_backup_" + newTable
}

func GetSearchSql(sp SearchParams) string {
	conditions := []string{}

	conditions = append(conditions, fmt.Sprintf("create_time between '%s' and '%s'", sp.BeginTime, sp.EndTime))

	if sp.Caller != "" {
		conditions = append(conditions, fmt.Sprintf("from_user='%s'", sp.Caller))
	}
	if sp.CallerDomain != "" {
		conditions = append(conditions, fmt.Sprintf("from_host='%s'", sp.CallerDomain))
	}
	if sp.Callee != "" {
		conditions = append(conditions, fmt.Sprintf("to_user='%s'", sp.Callee))
	}
	if sp.CalleeDomain != "" {
		conditions = append(conditions, fmt.Sprintf("to_host='%s'", sp.CalleeDomain))
	}

	columns := strings.Join(SearchFields, ",")
	conds := strings.Join(conditions, ",")
	tableName := GetTableName(sp.BeginTime)

	sql := fmt.Sprintf(`select %s from %s where sip_callid in (
		select sip_callid from (
			select distinct sip_callid from %s where %s
			limit %d
		) tmp
	  )
	  group by sip_callid order by create_time desc`, columns, tableName, tableName, conds, env.Conf.PageLimit)

	return sql
}
