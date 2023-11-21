package mysql

import (
	"fmt"
	"sipgrep/pkg/env"
	"sipgrep/pkg/log"
	"sipgrep/pkg/models"
	"sipgrep/pkg/prom"
	"sipgrep/pkg/util"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var db *gorm.DB

const MaxUserAgentLength = 40

type Record struct {
	ID         int64     `gorm:"column:id;type:bigint(20);autoIncrement;primaryKey"`
	SIPCallID  string    `gorm:"column:sip_call_id;index;type:char(64);not null;default:''"`
	SIPMethod  string    `gorm:"column:sip_method;index;type:char(20);not null;default:''"`
	CreateTime time.Time `gorm:"column:create_time;index;type:datetime;not null;default:CURRENT_TIMESTAMP"`
	ToUser     string    `gorm:"column:to_user;index;type:char(40);not null;default:''"`
	LegUid     string    `gorm:"column:leg_uid;index;type:char(64);not null;default:''"`
	FromUser   string    `gorm:"column:from_user;index;type:char(40);not null;default:''"`

	FsCallID string `gorm:"column:fs_call_id;type:char(64);not null; default:''"`

	ResponseCode int    `gorm:"column:response_code;type:int(11);not null;default:0"`
	ResponseDesc string `gorm:"column:response_desc;type:char(64);not null;default:''"`
	CSeqMethod   string `gorm:"column:cseq_method;type:char(20);not null;default:''"`
	CSeqNumber   int    `gorm:"column:cseq_number;type:int(11);not null;default:0"`

	FromHost       string `gorm:"column:from_host;type:char(64);not null;default:''"`
	ToHost         string `gorm:"column:to_host;type:char(64);not null;default:''"`
	SIPProtocol    uint   `gorm:"column:sip_protocol;type:int(11);not null;default:0"`
	UserAgent      string `gorm:"column:user_agent;type:char(40);not null;default:''"`
	SrcHost        string `gorm:"column:src_host;type:char(32);not null;default:''"`
	DstHost        string `gorm:"column:dst_host;type:char(32);not null;default:''"`
	TimestampMicro uint32 `gorm:"column:timestamp_micro;type:int(11);not null;default:0"`
	RawMsg         string `gorm:"column:raw_msg;type:text;not null"`
}

type CallTable struct {
	Record
	MsgCount int
}

var maxBatchItems = env.Conf.MaxBatchItems
var batchChan = make(chan *Record, maxBatchItems*2)
var ticker = time.NewTicker(time.Second * time.Duration(env.Conf.TickerSecondTime))

func BatchSaveInit() {

	for {
		// 一次性开辟需要的内存空间， 而不是动态开辟
		batchItems := make([]*Record, 0, maxBatchItems)
		i := 0
		for ; i < maxBatchItems; i++ {
			// 默认情况下，当达到最大的插入批次量时，就执行插入语句
			select {
			case <-ticker.C:
				// 但是在抓包比较少的情况下，希望在达到一定的延迟后，也可以自动插入
				log.Infof("ticker for saving to db")
				i = maxBatchItems
			default:
				batchItems = append(batchItems, <-batchChan)
			}
		}

		log.Infof("start batch insert: %v", len(batchItems))
		prom.MsgCount.With(prometheus.Labels{"type": "batch_insert"}).Inc()
		go db.Create(&batchItems)

	}
}

func Save(s *models.SIP) {
	ua := s.UserAgent

	if len(ua) > MaxUserAgentLength {
		ua = ua[:MaxUserAgentLength]
	}

	RawMsg := *s.Raw

	item := Record{
		FsCallID:       s.FSCallID,
		LegUid:         s.UID,
		SIPMethod:      s.Title,
		ResponseCode:   s.ResponseCode,
		ResponseDesc:   s.ResponseDesc,
		CSeqMethod:     s.CSeqMethod,
		CSeqNumber:     s.CSeqNumber,
		FromUser:       s.FromUsername,
		FromHost:       s.FromDomain,
		ToUser:         util.ReverseString(s.ToUsername), // 被叫号码翻转后存储, 方便查询时不需要加前缀
		ToHost:         s.ToDomain,
		SIPCallID:      s.CallID,
		SIPProtocol:    uint(s.Protocol),
		UserAgent:      ua,
		SrcHost:        s.SrcAddr,
		DstHost:        s.DstAddr,
		CreateTime:     s.CreateAt,
		TimestampMicro: s.TimestampMicro,
		RawMsg:         RawMsg,
	}

	prom.MsgCount.With(prometheus.Labels{"type": "ready_save_to_db"}).Inc()

	batchChan <- &item
}

func Connect(UserPasswd, Addr, DBName string) {
	var err error
	dsn := fmt.Sprintf("%s@tcp(%s)/%s?charset=utf8mb4&parseTime=True&loc=Local&sql_mode=TRADITIONAL", UserPasswd, Addr, DBName)

	db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		SkipDefaultTransaction: true,
		PrepareStmt:            true,
	})

	if err != nil {
		log.Fatalf("connect mysql error: %s", err)
	}

	sqlDB, err := db.DB()

	// SetMaxIdleConns sets the maximum number of connections in the idle connection pool.
	sqlDB.SetMaxIdleConns(env.Conf.SqlMaxIdleConn)

	// SetMaxOpenConns sets the maximum number of open connections to the database.
	sqlDB.SetMaxOpenConns(env.Conf.SqlMaxOpenConn)

	// SetConnMaxLifetime sets the maximum amount of time a connection may be reused.
	sqlDB.SetConnMaxLifetime(time.Minute)

	db.AutoMigrate(&Record{})
}

func FindBySIPCallID(Date, SIPCallID string) ([]Record, error) {
	var re []Record

	tableName := GetTableName(Date)

	sqlRE := db.Table(tableName).Where("sip_call_id = ?", SIPCallID).Order("create_time, timestamp_micro").Find(&re)

	if sqlRE.Error != nil {
		return nil, sqlRE.Error
	}

	return re, nil
}

func Search(sql string) ([]CallTable, error) {
	rows, err := db.Raw(sql).Rows()

	if err != nil {
		return nil, err
	}

	table := make([]CallTable, 0, env.Conf.PageLimit)

	defer rows.Close()

	for rows.Next() {
		item := CallTable{}

		err := rows.Scan(
			&item.ID,
			&item.SIPCallID,
			&item.CreateTime,
			&item.FromUser,
			&item.FromHost,
			&item.ToUser,
			&item.ToHost,
			&item.UserAgent,
			&item.SIPProtocol,
			&item.SIPMethod,
			&item.CSeqMethod,
			&item.FsCallID,
			&item.LegUid,
			&item.MsgCount,
		)

		if err != nil {
			log.Errorf("sql scan error: %v", err)
		}

		table = append(table, item)
	}

	return table, nil
}
