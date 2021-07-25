package sipparse

import (
	"errors"
	"strings"
)

const EndFlag = "\r\n"

type SIP struct {
	Method     string
	RequestURL string
	FromUser   string
	FromDomain string
	ToUser     string
	ToDomain   string
	UserAgent  string
	CseqNumber string
	CseqMethod string
	CallId     string
	IsRequest  bool
	Status     int
	Raw        string
}

func DecodeSIP(string) (*SIP, error) {
	sip := SIP{}
	return &sip, nil
}

func GetHeaderValue(msg *string, header string) (string, error) {
	if *msg == "" {
		return "", errors.New("header name is empty")
	}

	if header == "" {
		return "", errors.New("header name is empty")
	}

	startIndex := strings.Index(*msg, header)

	if startIndex == -1 {
		return "", errors.New("can not find token " + header)
	}

	newS := (*msg)[startIndex:]

	endIndex := strings.Index(newS, EndFlag) + startIndex

	if endIndex == startIndex-1 {
		return "", errors.New("can not find end Flag ")
	}

	return strings.TrimSpace((*msg)[startIndex+len(header)+1 : endIndex]), nil
}

// 	Request 	: INVITE bob@example.com SIP/2.0
// 	Response 	: SIP/2.0 200 OK
// 	Response	: SIP/2.0 501 Not Implemented
func ParseFirstLine(msg *string) (bool, string, error) {
	firstLineIndex := strings.Index(*msg, EndFlag)
	if firstLineIndex == -1 {
		return false, "", errors.New("can not find endFlag")
	}

	firstLine := (*msg)[:firstLineIndex]

	sp := strings.SplitN(firstLine, " ", 3)

	if len(sp) != 3 {
		return false, "", errors.New("bad first line " + firstLine)
	}

	if strings.HasPrefix(sp[0], "SIP") {
		return true, sp[0], nil
	} else {
		return false, sp[1], nil
	}
}
