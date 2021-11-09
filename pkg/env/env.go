package env

import (
	"log"

	"github.com/caarlos0/env/v6"
)

type config struct {
	UDPListenPort         int    `env:"UDPListenPort" envDefault:"9060"`
	MaxPackgeLength       int    `env:"MaxPackgeLength" envDefault:"2048"`
	MaxReadTimeoutSeconds int    `env:"MaxReadTimeoutSecond" envDefault:"5"`
	LogLevel              string `env:"LogLevel" envDefault:"debug"`
	Hostname              string `env:"HOSTNAME" envDefault:"unknow"`
	HeaderUIDName         string `env:"HeaderUIDName"`
	HeaderFSCallIDName    string `env:"HeaderFSCallIDName"`
	DiscardMethods        string `env:"DiscardMethods" envDefault:""`
	MinPackgeLength       int    `env:"MinPackgeLength" envDefault:"24"`
	SqlMaxOpenConn        int    `env:"SqlMaxOpenConn" envDefault:"24"`
	DBUserPasswd          string `env:"DBUserPasswd" envDefault:"root:123456"`
	DBAddr                string `env:"DBAddr" envDefault:"localhost"`
	DBName                string `env:"DBName" envDefault:"siphub"`
	CalleeFrom            string `env:"CalleeFrom" envDefault:"RURI"`
}

var Conf = config{}

func init() {
	if err := env.Parse(&Conf); err != nil {
		log.Fatalf("%+v\n", err)
	} else {
		log.Printf("%+v\n", err)
	}
}
