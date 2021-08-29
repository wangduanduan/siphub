package udpserver

import (
	"net"
	"siphub/pkg/hep"
	"siphub/pkg/log"
	"siphub/pkg/models"
	"siphub/pkg/parser"
)

func HepServer(p []byte, remoteAddr *net.UDPAddr) {
	log.Debugf("%s %v", string(p), remoteAddr)
	hepMsg, err := hep.NewHepMsg(p)

	if err != nil {
		log.Errorf("%+v", err)
		log.Errorf("%s", p)
		return
	}

	log.Infof("%+v", hepMsg)

	if hepMsg.Body == "" {
		return
	}

	sip := parser.Parser{
		models.SIP{
			Raw: hepMsg.Body,
		},
	}

	sip.ParseCseq()

}
