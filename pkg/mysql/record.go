package mysql

import (
	"fmt"
	"siphub/pkg/env"
	"siphub/pkg/log"
	"siphub/pkg/models"
	"siphub/pkg/prom"
	"siphub/pkg/util"
	"time"

	gonanoid "github.com/matoous/go-nanoid/v2"
	"github.com/prometheus/client_golang/prometheus"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var db *gorm.DB

const MaxUserAgentLength = 40

type Record struct {
	ID             string    `gorm:"primaryKey;type:char(22);not null;default ''"`
	FsCallid       string    `gorm:"type:char(64);not null; default:''"`
	LegUid         string    `gorm:"index;type:char(64);not null;default:''"`
	SipMethod      string    `gorm:"index;type:char(20);not null;default:''"`
	ResponseCode   int       `gorm:"index;type:int(11);not null;default:0"`
	ResponseDesc   string    `gorm:"index;type:char(64);not null;default:''"`
	CseqMethod     string    `gorm:"index;type:char(20);not null;default:''"`
	CseqNumber     int       `gorm:"type:int(11);not null;default:0"`
	FromUser       string    `gorm:"index;type:char(40);not null;default:''"`
	FromHost       string    `gorm:"index;type:char(64);not null;default:''"`
	ToUser         string    `gorm:"index;type:char(40);not null;default:''"`
	ToHost         string    `gorm:"index;type:char(64);not null;default:''"`
	SipCallid      string    `gorm:"index;type:char(64);not null;default:''"`
	SipProtocol    uint      `gorm:"type:int(11);not null;default:0"`
	IsRequest      uint      `gorm:"index;type:int(11);not null;default:0"`
	UserAgent      string    `gorm:"type:char(40);not null;default:''"`
	SrcHost        string    `gorm:"type:char(32);not null;default:''"`
	DstHost        string    `gorm:"type:char(32);not null;default:''"`
	CreateTime     time.Time `gorm:"index;type:datetime;not null;default:CURRENT_TIMESTAMP"`
	TimestampMicro uint32    `gorm:"type:int(11);not null;default:0"`
	RawMsg         string    `gorm:"type:text;not null"`
}

func DeleteOldRecordsNew(keepHours int) {
	d, err := time.ParseDuration(env.Conf.DeleteCronStr)
	if err != nil {
		log.Errorf("DeleteCronStr parse error: %v", err)
		return
	}
	deadLine := time.Now().Add(-time.Hour * time.Duration(keepHours))
	startLine := deadLine.Add(-d)

	deadLineStr := deadLine.Format("2006-01-02 15:04:05")
	startLineStr := startLine.Format("2006-01-02 15:04:05")

	result := db.Delete(Record{}, "create_time between ? and ?", startLineStr, deadLineStr)

	log.Warnf("delete old from %s to %s:  %v records, error: %v", startLineStr, deadLineStr, result.RowsAffected, result.Error)
}

func DeleteOldRecords(keepHours int) {
	var count, i int64

	deadLine := time.Now().Add(-time.Hour * time.Duration(keepHours))

	deadLineStr := deadLine.Format("2006-01-02 15:04:05")

	db.Model(&Record{}).Where("create_time < ?", deadLineStr).Count(&count)

	log.Infof("all %d records need be delete", count)

	loop := count / int64(env.Conf.MaxDeleteLimit)

	log.Infof("will loop %d detete record", loop)

	prom.MsgCount.With(prometheus.Labels{"type": "batch_delete"}).Inc()

	for i = 0; i < loop+1; i++ {
		prom.MsgCount.With(prometheus.Labels{"type": "batch_delete_item"}).Inc()

		result := db.Debug().Delete(Record{}, "create_time < ? limit ?", deadLineStr, env.Conf.MaxDeleteLimit)

		log.Infof("%d: delete old %v records, error: %v", i, result.RowsAffected, result.Error)
	}
}

var maxBatchItems = env.Conf.MaxBatchItems
var batchChan = make(chan *Record, maxBatchItems*2)

func BatchSaveInit() {
	for {
		batchItems := make([]*Record, maxBatchItems)

		for i := 0; i < maxBatchItems; i++ {
			batchItems[i] = <-batchChan
		}

		log.Infof("start batch insert: %v", len(batchItems))
		prom.MsgCount.With(prometheus.Labels{"type": "batch_insert"}).Inc()
		go db.Create(&batchItems)
	}
}

func Save(s *models.SIP) {
	ua := s.UserAgent
	isRequest := 0

	if len(ua) > MaxUserAgentLength {
		ua = ua[:MaxUserAgentLength]
	}

	if s.IsRequest == true {
		isRequest = 1
	}

	id, err := gonanoid.New()

	if err != nil {
		log.Errorf("new nanoid error %v", err)
		return
	}

	RawMsg := *s.Raw

	item := Record{
		ID:             id,
		FsCallid:       s.FSCallID,
		LegUid:         s.UID,
		SipMethod:      s.Title,
		ResponseCode:   s.ResponseCode,
		ResponseDesc:   s.ResponseDesc,
		CseqMethod:     s.CSeqMethod,
		CseqNumber:     s.CSeqNumber,
		FromUser:       s.FromUsername,
		FromHost:       s.FromDomain,
		ToUser:         util.ReverseString(s.ToUsername), // 被叫号码翻转后存储, 方便查询时不需要加前缀
		ToHost:         s.ToDomain,
		SipCallid:      s.CallID,
		IsRequest:      uint(isRequest),
		SipProtocol:    uint(s.Protocol),
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
	dsn := fmt.Sprintf("%s@tcp(%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", UserPasswd, Addr, DBName)

	db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})

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
