package config

import (
	"time"
)

var UDPPort = 8866

var MaxUDPSize = 2 * 1024

var MaxReadTimeoutSecond = 5 * time.Second
