package udpserver

import (
	"github.com/pkg/errors"
	"net"
	"siphub/pkg/env"
	"siphub/pkg/hep"
	"siphub/pkg/log"
	"siphub/pkg/models"
	"siphub/pkg/parser"
	"strings"
)

func SIPServer(p []byte, remoteAddr *net.UDPAddr) (s *models.SIP, e error) {
	log.Debugf("%s %v", string(p), remoteAddr)
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
		return
	}

	sip.ParseCallID()

	if sip.CallID == "" {
		return
	}

	sip.ParseFirstLine()

	if sip.Title == "" {
		return
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
}
