package prom

import (
	"github.com/prometheus/client_golang/prometheus"
)

var MsgCount = prometheus.NewCounterVec(
	prometheus.CounterOpts{
		Name: "sipgrep_msg_count",
	},
	[]string{"type"},
)

func init() {
	prometheus.MustRegister(
		MsgCount,
	)
}
