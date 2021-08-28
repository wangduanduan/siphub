package parser

import (
	"siphub/pkg/models"
	"strings"
)

var empty = struct{}{}
var acceptMethods map[string]struct{}
var discardMethods map[string]struct{}

const CRLF = "\r\n"

const (
	ParseOk = iota
	ECanNotFindHeader
	EBadHeaderValue
)

const EmptyStr = ""

type Parser struct {
	models.SIP
}

// 	Request 	: INVITE bob@example.com SIP/2.0
// 	Response 	: SIP/2.0 200 OK
// 	Response	: SIP/2.0 501 Not Implemented
func (p *Parser) ParseFirstLine() {
	if p.Raw == nil {
		return
	}
	if *p.Raw == EmptyStr {
		return
	}

	firstLineIndex := strings.Index(*p.Raw, CRLF)
	if firstLineIndex == -1 {
		return
	}
	firstLine := (*p.Raw)[:firstLineIndex]
	firstLineMeta := strings.SplitN(firstLine, " ", 3)

	if len(firstLineMeta) != 3 {
		return
	}
	if strings.HasPrefix(firstLineMeta[0], "SIP") {
		p.IsRequest = false
		p.Title = firstLineMeta[1]
		return
	}
	p.IsRequest = true
	p.Title = firstLineMeta[0]
	p.RequestURL = firstLineMeta[1]
}

func (p *Parser) ParseRequestURL() {
	if p.RequestURL == "" {
		return
	}
	user, domain := ParseSIPURL(p.RequestURL)
	p.RequestDomain = domain
	p.RequestUsername = user
}

func (p *Parser) ParseFrom() {
	v := p.GetHeaderValue(models.HeaderFrom)
	if v == EmptyStr {
		return
	}
	user, domain := ParseSIPURL(v)
	p.FromUsername = user
	p.FromDomain = domain
}

func (p *Parser) ParseTo() {
	v := p.GetHeaderValue(models.HeaderTo)
	if v == EmptyStr {
		return
	}
	user, domain := ParseSIPURL(v)
	p.ToUsername = user
	p.ToDomain = domain
}

func (p *Parser) ParseUserAgent() {
	v := p.GetHeaderValue(models.HeaderUA)
	if v == EmptyStr {
		return
	}
	p.UserAgent = v
}

func (p *Parser) ParseCallID() {
	v := p.GetHeaderValue(models.HeaderCallID)
	if v == EmptyStr {
		return
	}
	p.CallID = v
}

// "Bob" <sips:bob@biloxi.com> ;tag=a48s
// sip:+12125551212@phone2net.com;tag=887s
// Anonymous <sip:c8oqz84zk7z@privacy.org>;tag=hyh8
// Carol <sip:carol@chicago.com>
// sip:carol@chicago.com
func ParseSIPURL(s string) (string, string) {
	if s == "" {
		return "", ""
	}

	newURL := s

	if strings.Contains(s, "<") {
		start := strings.Index(s, "<")
		end := strings.Index(s, ">")
		if start > end {
			return "", ""
		}
		newURL = s[start:end]
	}

	a := strings.Index(newURL, ":")
	b := strings.Index(newURL, "@")
	c := strings.Index(newURL, ";")

	if a == -1 {
		return "", ""
	}

	if b == -1 && b < len(newURL) {
		if c == -1 {
			return "", newURL[a+1:]
		}
		if c > b {
			return "", newURL[a+1 : c]
		}
	}

	if c == -1 {
		c = len(newURL)
	}

	user := newURL[a+1 : b]
	domain := newURL[b+1 : c]
	return user, domain
}

func (p *Parser) ParseCseq() {
	cseqValue := p.GetHeaderValue(models.HeaderCSeq)
	if cseqValue == EmptyStr {
		return
	}
	cs := strings.SplitN(cseqValue, " ", 2)
	if len(cs) != 2 {
		return
	}
	p.CSeqNumber = cs[0]
	p.CSeqMethod = cs[1]
}

func (p *Parser) GetHeaderValue(header string) (v string) {
	if *p.Raw == EmptyStr || header == EmptyStr {
		return EmptyStr
	}

	if strings.Contains(header, CRLF) || strings.Contains(header, " ") {
		return EmptyStr
	}

	startIndex := strings.Index(*p.Raw, header+":")

	if startIndex == -1 {
		return EmptyStr
	}

	newStr := (*p.Raw)[startIndex:]

	endIndex := strings.Index(newStr, CRLF)

	if endIndex == -1 {
		return EmptyStr
	}

	if len(header)+1 > endIndex {
		return EmptyStr
	}

	return strings.TrimSpace(newStr[len(header)+1 : endIndex])
}

func (p *Parser) ParseUID(HeaderUIDName string) {
	if HeaderUIDName == "" {
		return
	}

	v := p.GetHeaderValue(HeaderUIDName)
	if v == EmptyStr {
		return
	}
	p.UID = v
}

func (p *Parser) ParseFSCallID(FSCallID string) {
	if FSCallID == "" {
		return
	}

	v := p.GetHeaderValue(FSCallID)
	if v == EmptyStr {
		return
	}
	p.FSCallID = v
}

func init() {
	am := map[string]struct{}{
		"INVITE":    empty,
		"CANCEL":    empty,
		"ACK":       empty,
		"BYE":       empty,
		"INFO":      empty,
		"OPTIONS":   empty,
		"UPDATE":    empty,
		"REGISTER":  empty,
		"MESSAGE":   empty,
		"SUBSCRIBE": empty,
		"NOTIFY":    empty,
		"PRACK":     empty,
		"REFER":     empty,
		"PUBLISH":   empty,
	}

	// may be read from env
	dm := map[string]struct{}{
		"INFO":      empty,
		"OPTIONS":   empty,
		"REGISTER":  empty,
		"MESSAGE":   empty,
		"SUBSCRIBE": empty,
		"PUBLISH":   empty,
	}

	acceptMethods = am
	discardMethods = dm
}
