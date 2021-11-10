package mysql

import (
	"fmt"
	"siphub/pkg/log"
	"siphub/pkg/models"
	"siphub/pkg/prom"
	"siphub/pkg/util"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var db *gorm.DB

const MaxUserAgentLength = 40

type Record struct {
	ID          uint      `gorm:"primaryKey"`                                             // `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
	FsCallid    string    `gorm:"type:char(64);not null; default:''"`                     // `fs_callid` char(64) NOT NULL DEFAULT '',
	LegUid      string    `gorm:"index;type:char(64);not null;default:''"`                // `leg_uid` char(64) NOT NULL DEFAULT '',
	SipMethod   string    `gorm:"index;type:char(20);not null;default:''"`                // `sip_method` char(20) NOT NULL DEFAULT '',
	FromUser    string    `gorm:"index;type:char(40);not null;default:''"`                // `from_user` char(40) NOT NULL DEFAULT '',
	FromHost    string    `gorm:"index;type:char(64);not null;default:''"`                // `from_host` char(64) NOT NULL DEFAULT '',
	ToUser      string    `gorm:"index;type:char(40);not null;default:''"`                // `to_user` char(40) NOT NULL DEFAULT '',
	ToHost      string    `gorm:"index;type:char(64);not null;default:''"`                // `to_host` char(64) NOT NULL DEFAULT '',
	SipCallid   string    `gorm:"index;type:char(64);not null;default:''"`                // `sip_callid` char(64) NOT NULL DEFAULT '',
	SipProtocol uint      `gorm:"type:int(11);not null;default:0"`                        // `sip_protocol` int(11) NOT NULL,
	IsRequest   uint      `gorm:"index;type:int(11);not null;default:0"`                  // `sip_protocol` int(11) NOT NULL,
	UserAgent   string    `gorm:"type:char(40);not null;default:''"`                      // `user_agent` char(40) NOT NULL DEFAULT '',
	SrcHost     string    `gorm:"type:char(32);not null;default:''"`                      // `src_host` char(32) NOT NULL DEFAULT '',
	DstHost     string    `gorm:"type:char(32);not null;default:''"`                      // `dst_host` char(32) NOT NULL DEFAULT '',
	CreateTime  time.Time `gorm:"index;type:datetime;not null;default:CURRENT_TIMESTAMP"` // `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	RawMsg      string    `gorm:"type:text;not null"`                                     // `raw_msg` text NOT NULL,
}

func DeleteOldRecords(keepHours int) {
	deadLine := time.Now().Add(-time.Hour * time.Duration(keepHours))
	log.Infof("delete old file before %v", deadLine)
	result := db.Debug().Delete(Record{}, "create_time < ?", deadLine.Format("2006-01-02 15:04:05"))
	log.Infof("delete old %v records, error: %v", result.RowsAffected, result.Error)
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

	item := Record{
		FsCallid:    s.FSCallID,
		LegUid:      s.UID,
		SipMethod:   s.Title,
		FromUser:    s.FromUsername,
		FromHost:    s.FromDomain,
		ToUser:      util.ReverseString(s.ToUsername), // 被叫号码翻转后存储, 方便查询时不需要加前缀
		ToHost:      s.ToDomain,
		SipCallid:   s.CallID,
		IsRequest:   uint(isRequest),
		SipProtocol: uint(s.Protocol),
		UserAgent:   ua,
		SrcHost:     s.SrcAddr,
		DstHost:     s.DstAddr,
		CreateTime:  s.CreateAt,
		RawMsg:      *s.Raw,
	}

	result := db.Create(&item)

	if result.Error != nil {
		prom.MsgCount.With(prometheus.Labels{"type": "save_to_db_error"}).Inc()
		log.Errorf("save to db error: %v", result.Error)
	} else {
		prom.MsgCount.With(prometheus.Labels{"type": "save_to_db_success"}).Inc()
	}
}

func Connect(UserPasswd, Addr, DBName string) {
	var err error
	dsn := fmt.Sprintf("%s@tcp(%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", UserPasswd, Addr, DBName)

	db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatalf("connect mysql error: %s", err)
	}

	db.AutoMigrate(&Record{})
}
