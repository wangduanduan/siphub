package msg

import (
	"fmt"
	"github.com/pkg/errors"
	"siphub/pkg/env"
	"siphub/pkg/hep"
	"siphub/pkg/log"
	"siphub/pkg/models"
	"siphub/pkg/parser"
	"strings"
)

func Format (p []byte) (s *models.SIP, e error) {
	log.Debugf("%s", string(p))
	hepMsg, err := hep.NewHepMsg(p)

	if err != nil {
		log.Errorf("%+v", err)
		log.Errorf("%s", p)
		return nil, errors.Wrap(err, "parse hep erro")
	}

	log.Infof("%+v", hepMsg)

	if hepMsg.Body == "" {
		return nil, errors.New("body is empty")
	}

	if len(hepMsg.Body) < env.Conf.MinPackgeLength {
		return nil, errors.Errorf("body too small: %d", len(hepMsg.Body))
	}

	sip := parser.Parser{
		SIP: models.SIP{
			Raw: &hepMsg.Body,
		}}

	sip.ParseCseq()

	if sip.CSeqMethod == "" {
		return nil, errors.Errorf("body too small: %d", len(hepMsg.Body))
	}

	// message need be discarded
	if strings.Contains(env.Conf.DiscardMethods, sip.CSeqMethod) {
		return nil, errors.Errorf("discard method: %s", sip.CSeqMethod)
	}

	sip.ParseCallID()

	if sip.CallID == "" {
		return nil, errors.New("has no callid")
	}

	sip.ParseFirstLine()

	if sip.Title == "" {
		return nil, errors.New("has no title")
	}

	if sip.RequestURL != "" {
		sip.ParseRequestURL()
	}

	sip.ParseFrom()
	sip.ParseTo()
	sip.ParseTo()
	sip.ParseUserAgent()

	if env.Conf.HeaderFSCallIDName != "" {
		sip.ParseFSCallID(env.Conf.HeaderFSCallIDName)
	}

	if env.Conf.HeaderUIDName != "" {
		sip.ParseFSCallID(env.Conf.HeaderUIDName)
	}

	sip.Protocol = int(hepMsg.ProtocolType)
	sip.SrcAddr = fmt.Sprintf("%s_%d", hepMsg.IP4SourceAddress, hepMsg.SourcePort)
	sip.DstAddr = fmt.Sprintf("%s_%d", hepMsg.IP4DestinationAddress, hepMsg.DestinationPort)

	return &sip.SIP, nil
}
