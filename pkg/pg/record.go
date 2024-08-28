package pg

import (
	"context"
	"database/sql"
	"sipgrep/pkg/log"
	"sipgrep/pkg/env"
	"time"

	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
)

type SIPFlow struct {
	bun.BaseModel `bun:"table:sip_flow,alias:s"`

	ID int64 `bun:"id,pk,autoincrement"`
	CallID   string    `bun:"call_id,type:char(64),default:''"`
	FSID     string    `bun:"fs_id,type:char(64),default:''"`
	UID      string    `bun:"uid,type:char(64),default:''"`
	CreateAt time.Time `bun:"create_at,pk,type:timestamp,default:current_timestamp"`
	CreateAtMS int    `bun:"create_at_ms,type:int,default:0"`
	SIPMethod  string `bun:"sip_method,type:char(16),default:''"`
	ToUser     string `bun:"to_user,type:char(64),default:''"`
	ToDomain   string `bun:"to_domain,type:char(64),default:''"`
	FromUser   string `bun:"from_user,type:char(64),default:''"`
	FromDomain string `bun:"from_domain,type:char(64),default:''"`
	ResCode    int    `bun:"res_code,type:int,default:0"`
	ResDesc    string `bun:"res_desc,type:char(64),default:''"`
	CSeqMethod string `bun:"cseq_method,type:char(64),default:''"`
	CSeqNo     int    `bun:"cseq_no,type:int,default:0"`
	SrcHost    string `bun:"src_host,type:char(32),default:''"`
	DstHost    string `bun:"dst_host,type:char(32),default:''"`
	UA         string `bun:"ua,type:char(64),default:''"`
	RawMsg     string `bun:"raw_msg,type:text,default:''"`
}

var DB *bun.DB

func isPartitionExist(){
	re, err := DB.Exec(`SELECT EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_inherits i ON c.oid = i.inhrelid
    WHERE i.inhparent = 'sip_flow'::regclass
    AND c.relname = 'sip_flow_2024_08_26'
);`)
	if err != nil {
		log.Errorf("%#v", err)
	} else {
		
	}
}

func init() {
	ctx := context.Background()
	log.Infof("start connect pgsql")
	dsn := "postgres://wangduanduan:@localhost:5432/postgres?sslmode=disable"
	sqldb := sql.OpenDB(pgdriver.NewConnector(pgdriver.WithDSN(dsn)))
	DB = bun.NewDB(sqldb, pgdialect.New())

	DB.SetMaxIdleConns(env.Conf.SqlMaxIdleConn)
	DB.SetMaxOpenConns(env.Conf.SqlMaxOpenConn)
	DB.SetConnMaxLifetime(time.Minute)

	_, err := DB.NewCreateTable().
		Model((*SIPFlow)(nil)).
		PartitionBy("RANGE (create_at)").
		IfNotExists().
		Exec(ctx)

	if err != nil {
		log.Errorf("%#v", err)
	} else {
		log.Infof("创建成功")
	}
}
