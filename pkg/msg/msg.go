package msg

import (
	"fmt"
	"net"
	"sipgrep/pkg/env"
	"sipgrep/pkg/hep"
	"sipgrep/pkg/log"
	"sipgrep/pkg/models"
	"sipgrep/pkg/parser"
	"sipgrep/pkg/prom"
	"strings"
	"time"

	"github.com/prometheus/client_golang/prometheus"
)

type dbSave func(*models.SIP)

func OnMessage(b []byte, fn dbSave, ip net.IP) {
	sip, errType, _ := Format(b)

	if errType != "" {
		if errType != "method_discarded" {
			log.Errorf("format msg error: %v; raw length: %d, %s,  from: %v", errType, len(b), b, ip)
		}
		prom.MsgCount.With(prometheus.Labels{"type": errType}).Inc()
		return
	}

	prom.MsgCount.With(prometheus.Labels{"type": "hep_parse_ok"}).Inc()
	log.Infof("%s %s->%s", sip.Title, sip.FromUsername+sip.FromDomain, sip.ToUsername+sip.FromDomain)
	fn(sip)
}

func Format(p []byte) (s *models.SIP, errorType string, errMsg string) {
	hepMsg, err := hep.NewHepMsg(p)

	if err != nil {
		log.Errorf("NewHepMsg error %v", err)
		return nil, "hep_parse_error", ""
	}

	if hepMsg.Body == "" {
		return nil, "hep_body_is_empty", ""
	}

	if len(hepMsg.Body) < env.Conf.MinPacketLength {
		return nil, "hep_body_is_too_small", ""
	}

	sip := parser.Parser{
		SIP: models.SIP{
			Raw: &hepMsg.Body,
		}}

	sip.ParseCseq()

	sip.TimestampMicro = hepMsg.TimestampMicro

	if sip.CSeqMethod == "" {
		return nil, "cseq_is_empty", ""
	}

	if strings.Contains(env.Conf.DiscardMethods, sip.CSeqMethod) {
		return nil, "method_discarded", sip.CSeqMethod
	}

	sip.ParseCallID()

	if sip.CallID == "" {
		return nil, "callid_is_empty", ""
	}

	sip.ParseFirstLine()

	if sip.Title == "" {
		return nil, "title_is_empty", ""
	}

	if sip.RequestURL != "" {
		sip.ParseRequestURL()
	}

	sip.ParseFrom()
	sip.ParseTo()
	sip.ParseUserAgent()
	sip.CreateAt = time.Unix(int64(hepMsg.Timestamp), 0)

	if env.Conf.HeaderFSCallIDName != "" {
		sip.ParseFSCallID(env.Conf.HeaderFSCallIDName)
	}

	if env.Conf.HeaderUIDName != "" {
		sip.ParseUID(env.Conf.HeaderUIDName)
	}

	sip.Protocol = int(hepMsg.IPProtocolID)
	sip.SrcAddr = fmt.Sprintf("%s_%d", hepMsg.IP4SourceAddress, hepMsg.SourcePort)
	sip.DstAddr = fmt.Sprintf("%s_%d", hepMsg.IP4DestinationAddress, hepMsg.DestinationPort)

	return &sip.SIP, "", ""
}
