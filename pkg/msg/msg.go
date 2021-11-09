package msg

import (
	"fmt"
	"siphub/pkg/env"
	"siphub/pkg/hep"
	"siphub/pkg/log"
	"siphub/pkg/models"
	"siphub/pkg/parser"
	"siphub/pkg/prom"
	"strings"
	"time"

	"github.com/prometheus/client_golang/prometheus"
)

type dbSave func(*models.SIP)

func OnMessage(b []byte, fn dbSave) {
	sip, errMsg := Format(b)
	if errMsg != "" {
		log.Infof("format msg error: %v; raw: %d, %s", errMsg, len(b), b)
		prom.MsgCount.With(prometheus.Labels{"type": errMsg})
		return
	}
	prom.MsgCount.With(prometheus.Labels{"type": "hep_parse_ok"})
	fn(sip)
}

func Format(p []byte) (s *models.SIP, errMsg string) {
	hepMsg, err := hep.NewHepMsg(p)

	if err != nil {
		return nil, "hep_parse_error"
	}

	if hepMsg.Body == "" {
		return nil, "hep_body_is_empty"
	}

	if len(hepMsg.Body) < env.Conf.MinPackgeLength {
		return nil, "hep_body_is_too_small"
	}

	sip := parser.Parser{
		SIP: models.SIP{
			Raw: &hepMsg.Body,
		}}

	sip.ParseCseq()

	if sip.CSeqMethod == "" {
		return nil, "cseq_is_empty"
	}

	if strings.Contains(env.Conf.DiscardMethods, sip.CSeqMethod) {
		return nil, "method_discarded"
	}

	sip.ParseCallID()

	if sip.CallID == "" {
		return nil, "callid_is_empty"
	}

	sip.ParseFirstLine()

	if sip.Title == "" {
		return nil, "title_is_empty"
	}

	if sip.RequestURL != "" {
		sip.ParseRequestURL()
	}

	sip.ParseFrom()
	sip.ParseTo()
	sip.ParseTo()
	sip.ParseUserAgent()
	sip.CreateAt = time.Unix(int64(hepMsg.Timestamp), 0)

	if env.Conf.HeaderFSCallIDName != "" {
		sip.ParseFSCallID(env.Conf.HeaderFSCallIDName)
	}

	if env.Conf.HeaderUIDName != "" {
		sip.ParseFSCallID(env.Conf.HeaderUIDName)
	}

	sip.Protocol = int(hepMsg.ProtocolType)
	sip.SrcAddr = fmt.Sprintf("%s_%d", hepMsg.IP4SourceAddress, hepMsg.SourcePort)
	sip.DstAddr = fmt.Sprintf("%s_%d", hepMsg.IP4DestinationAddress, hepMsg.DestinationPort)

	return &sip.SIP, ""
}
