package models

import "time"

const (
	HeaderCallID = "Call-ID"
	HeaderFrom   = "From"
	HeaderTo     = "To"
	HeaderUA     = "User-Agent"
	HeaderCSeq   = "CSeq"
)

type SIP struct {
	Title           string // Method or Status
	IsRequest       bool
	ResponseCode    int
	CallID          string
	RequestURL      string
	RequestUsername string
	RequestDomain   string
	ToUsername      string
	ToDomain        string
	FromUsername    string
	FromDomain      string
	CSeqNumber      int
	CSeqMethod      string
	UserAgent       string
	SrcAddr         string // IP:PORT
	DstAddr         string // IP:PORT
	CreateAt        time.Time
	Protocol        int
	UID             string  // correlative id for AB call leg
	FSCallID        string  // freeswitch CallID
	Raw             *string // raw sip message
}
