package env

import (
	"log"

	"github.com/caarlos0/env/v6"
)

type config struct {
	UDPListenPort         int    `env:"UDPListenPort" envDefault:"9060"`
	MaxPacketLength       int    `env:"MaxPacketLength" envDefault:"4096"`
	MaxReadTimeoutSeconds int    `env:"MaxReadTimeoutSecond" envDefault:"5"`
	LogLevel              string `env:"LogLevel" envDefault:"info"`
	Hostname              string `env:"HOSTNAME" envDefault:"unknow"`
	HeaderUIDName         string `env:"HeaderUIDName"`
	HeaderFSCallIDName    string `env:"HeaderFSCallIDName"`
	DiscardMethods        string `env:"DiscardMethods" envDefault:"OPTIONS"`
	MinPacketLength       int    `env:"MinPacketLength" envDefault:"24"`
	SqlMaxOpenConn        int    `env:"SqlMaxOpenConn" envDefault:"64"`
	SqlMaxIdleConn        int    `env:"SqlMaxIdleConn" envDefault:"64"`

	DBUser   string `env:"DBUser"`
	DBPasswd string `env:"DBPasswd"`

	DBAddr           string `env:"DBAddr" envDefault:"localhost"`
	DBName           string `env:"DBName" envDefault:"sipgrep"`
	CalleeFrom       string `env:"CalleeFrom" envDefault:"RURI"`
	MaxBatchItems    int    `env:"MaxBatchItems" envDefault:"20"`
	TickerSecondTime int    `env:"TickerSecondTime" envDefault:"20"`
	PageLimit        int    `env:"PageLimit" envDefault:"200"`
}

var Conf = config{}

func init() {
	if err := env.Parse(&Conf); err != nil {
		log.Fatalf("%+v\n", err)
	} else {
		// 只有在debug级别，才打印配置信息
		// 配置信息中存在mysql的密码
		if Conf.LogLevel == "debug" {
			log.Printf("%#v\n", Conf)
		}
	}

	if Conf.TickerSecondTime < 20 {
		log.Panicf("TickerSencondTime must bigger than 20. TickerSecondTime: %d", Conf.TickerSecondTime)
	}
}
