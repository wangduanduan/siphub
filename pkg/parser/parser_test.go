package parser

import (
	"testing"

	"siphub/pkg/models"

	"github.com/stretchr/testify/assert"
)

const inviteMsg = "INVITE sip:bob@biloxi.example.com SIP/2.0\r\n" +
	"Via: SIP/2.0/TCP client.atlanta.example.com:5060;branch=z9hG4bK74b43\r\n" +
	"Max-Forwards: 70\r\n" +
	"Route: <sip:ss1.atlanta.example.com;lr>\r\n" +
	"From: Alice <sip:alice@atlanta.example.com>;tag=9fxced76sl\r\n" +
	"To: Bob <sip:bob@biloxi.example.com>\r\n" +
	"Call-ID: 3848276298220188511@atlanta.example.com\r\n" +
	"CSeq: 1 INVITE\r\n" +
	"Contact: <sip:alice@client.atlanta.example.com;transport=tcp>\r\n" +
	"Content-Type: application/sdp\r\n" +
	"Content-Length: 151\r\n" +
	"User-Agent: iphone\r\n" +
	"X-UID: uid\r\n" +
	"X-FID: fsid\r\n" +
	"\r\n" +
	"\r\n" +
	"v=0\r\n" +
	"o=alice 2890844526 2890844526 IN IP4 client.atlanta.example.com\r\n" +
	"s=-\r\n" +
	"c=IN IP4 192.0.2.101\r\n" +
	"t=0 0\r\n" +
	"m=audio 49172 RTP/AVP 0\r\n" +
	"a=rtpmap:0 PCMU/8000\r\n"

func TestParseCSeq(t *testing.T) {
	successCases := []struct {
		in                 string
		expectedCseqNumber string
		expectedCseqMethod string
	}{
		{
			in:                 "CSeq: 123 INVITE\r\n",
			expectedCseqNumber: "123",
			expectedCseqMethod: "INVITE",
		},
		{
			in:                 "",
			expectedCseqNumber: "",
			expectedCseqMethod: "",
		},
		{
			in:                 "CSeq: 123 INVITE\r\n",
			expectedCseqNumber: "123",
			expectedCseqMethod: "INVITE",
		},
		{
			in:                 "CSeq: INVITE\r\n",
			expectedCseqNumber: "",
			expectedCseqMethod: "",
		},
	}

	for _, item := range successCases {
		sip := Parser{models.SIP{
			Raw: &item.in,
		}}
		sip.ParseCseq()
		assert.Equal(t, item.expectedCseqMethod, sip.CSeqMethod)
		assert.Equal(t, item.expectedCseqNumber, sip.CSeqNumber)
	}
}

func TestGetHeaderValue(t *testing.T) {

	successCases := []struct {
		in            string
		header        string
		expectedValue string
	}{
		{
			in:            "CSeq: 123 INVITE\r\n",
			header:        "CSeq",
			expectedValue: "123 INVITE",
		},
		{
			in:            "Call-ID: 1234\r\nCSeq: 123 INVITE\r\n",
			header:        "Call-ID",
			expectedValue: "1234",
		},
		{
			in:            "Call-ID: 1234\r\nCSeq: 123 INVITE\r\n",
			header:        "Call-ID\r\n",
			expectedValue: "",
		},
		{
			in:            "User-Agent: wdd\r\nCall-ID: 1234\r\nCSeq: 123 INVITE\r\n",
			header:        "",
			expectedValue: "",
		},
		{
			in:            "User-Agent: wdd\r\nCall-ID: 1234\r\nCSeq: 123 INVITE\r\n",
			header:        "Call-ID",
			expectedValue: "1234",
		},
		{
			in:            "User-Agent: wdd\r\nCall-ID: 1234\r\nCSeq: 123 INVITE\r\n",
			header:        "CSeq",
			expectedValue: "123 INVITE",
		},
		{
			in:            "User-Agent: wdd\r\nCall-ID: 1234\r\nCSeq: 123 INVITE\r\n",
			header:        "User-Agent",
			expectedValue: "wdd",
		},
		{
			in:            "",
			header:        "User-Agent",
			expectedValue: "",
		},
		{
			in:            inviteMsg,
			header:        "Via",
			expectedValue: "SIP/2.0/TCP client.atlanta.example.com:5060;branch=z9hG4bK74b43",
		},
		{
			in:            inviteMsg,
			header:        "Max-Forwards",
			expectedValue: "70",
		},
		{
			in:            inviteMsg,
			header:        "Route",
			expectedValue: "<sip:ss1.atlanta.example.com;lr>",
		},
		{
			in:            inviteMsg,
			header:        "From",
			expectedValue: "Alice <sip:alice@atlanta.example.com>;tag=9fxced76sl",
		},
		{
			in:            inviteMsg,
			header:        "To",
			expectedValue: "Bob <sip:bob@biloxi.example.com>",
		},
		{
			in:            inviteMsg,
			header:        "Call-ID",
			expectedValue: "3848276298220188511@atlanta.example.com",
		},
		{
			in:            inviteMsg,
			header:        "CSeq",
			expectedValue: "1 INVITE",
		},
		{
			in:            inviteMsg,
			header:        "Contact",
			expectedValue: "<sip:alice@client.atlanta.example.com;transport=tcp>",
		},
		{
			in:            inviteMsg,
			header:        "Content-Type",
			expectedValue: "application/sdp",
		},
		{
			in:            inviteMsg,
			header:        "Content-Length",
			expectedValue: "151",
		},
	}

	for _, item := range successCases {
		sip := Parser{
			models.SIP{
				Raw: &item.in,
			}}
		assert.Equal(t, item.expectedValue, sip.GetHeaderValue(item.header))
	}
}

func TestParseFirstLine(t *testing.T) {
	successCases := []struct {
		msg        string
		IsRequest  bool
		Title      string
		RequestURL string
	}{
		{"REGISTER sip:registrar.biloxi.com SIP/2.0\r\nVia: SIP/2.0/UDP bobspc.biloxi.com:5060;branch=z9hG4bKnashds7", true, "REGISTER", "sip:registrar.biloxi.com"},
		{"SIP/2.0 200 OK\r\nVia: SIP/2.0/UDP bobspc.biloxi.com:5060;branch=z9hG4bKnashds7", false, "200", ""},
		{"", false, "", ""},
	}

	for _, c := range successCases {
		sip := Parser{models.SIP{
			Raw: &c.msg,
		}}
		sip.ParseFirstLine()
		assert.Equal(t, c.IsRequest, sip.IsRequest)
		assert.Equal(t, c.Title, sip.Title)
		assert.Equal(t, c.RequestURL, sip.RequestURL)
	}
}

func TestParseSIPURL(t *testing.T) {
	successCases := []struct {
		msg    string
		user   string
		domain string
	}{
		{"<sip:1002@192.168.159.12>;tag=feffa1b1ce68471d8e0a97eb9a1dcb32", "1002", "192.168.159.12"},
		{"<sip:1002@192.168.159.12>", "1002", "192.168.159.12"},
		{"\"800004\" <sip:800004@001.com>;tag=v2Gl2kKLlTNNC.Nydij-ri02clU52sTZ", "800004", "001.com"},
		{"sip:800004@001.com", "800004", "001.com"},
		{"Carol <sip:carol@chicago.com>", "carol", "chicago.com"},
		{"sip:+12125551212@phone2net.com;tag=887s", "+12125551212", "phone2net.com"},
		{"", "", ""},
		{">sdfsdf<<", "", ""},
		{"+12125551212@phone2net.com;tag=887s", "", ""},
		{"+12125551212phone2net.com;tag=887s", "", ""},
		{"sip:net.com;tag=887s", "", "net.com"},
		{"sip:net.com", "", "net.com"},
	}

	for _, c := range successCases {
		user, domain := ParseSIPURL(c.msg)
		assert.Equal(t, c.user, user)
		assert.Equal(t, c.domain, domain)
	}
}

func test(t *testing.T) {
	successCases := []struct {
		msg        string
		IsRequest  bool
		Title      string
		RequestURL string
	}{
		{"REGISTER sip:registrar.biloxi.com SIP/2.0\r\nVia: SIP/2.0/UDP bobspc.biloxi.com:5060;branch=z9hG4bKnashds7", true, "REGISTER", "sip:registrar.biloxi.com"},
		{"SIP/2.0 200 OK\r\nVia: SIP/2.0/UDP bobspc.biloxi.com:5060;branch=z9hG4bKnashds7", false, "200", ""},
		{"", false, "", ""},
	}

	for _, c := range successCases {
		sip := Parser{models.SIP{
			Raw: &c.msg,
		}}
		sip.ParseFirstLine()
		assert.Equal(t, c.IsRequest, sip.IsRequest)
		assert.Equal(t, c.Title, sip.Title)
		assert.Equal(t, c.RequestURL, sip.RequestURL)
	}
}

func TestParseFromToUA(t *testing.T) {

	successCases := []struct {
		in         string
		header     string
		fromUser   string
		fromDomain string
		toUser     string
		toDomain   string
		callID     string
		ua         string
	}{
		{
			in:         inviteMsg,
			header:     "From",
			fromUser:   "alice",
			fromDomain: "atlanta.example.com",
			toUser:     "bob",
			toDomain:   "biloxi.example.com",
			ua:         "iphone",
			callID:     "3848276298220188511@atlanta.example.com",
		},
	}

	for _, item := range successCases {
		sip := Parser{
			models.SIP{
				Raw: &item.in,
			}}

		sip.ParseFrom()
		sip.ParseTo()
		sip.ParseFrom()
		sip.ParseUserAgent()
		sip.ParseCallID()

		assert.Equal(t, item.fromUser, sip.FromUsername)
		assert.Equal(t, item.fromDomain, sip.FromDomain)
		assert.Equal(t, item.toUser, sip.ToUsername)
		assert.Equal(t, item.toDomain, sip.ToDomain)
		assert.Equal(t, item.ua, sip.UserAgent)
		assert.Equal(t, item.callID, sip.CallID)
	}
}

func TestParseUIDAndFSCallID(t *testing.T) {

	successCases := []struct {
		in  string
		uid string
		fid string
	}{
		{
			in:  "X-UID: myuid\r\nX-FID: test-fs-id\r\n",
			uid: "myuid",
			fid: "test-fs-id",
		},
		{
			in:  inviteMsg,
			uid: "uid",
			fid: "fsid",
		},
	}

	for _, item := range successCases {
		sip := Parser{
			models.SIP{
				Raw: &item.in,
			}}

        sip.ParseUID("X-UID")
        sip.ParseFSCallID("X-FID")

		assert.Equal(t, item.uid, sip.UID)
		assert.Equal(t, item.fid, sip.FSCallID)
	}
}

func TestParseCallID(t *testing.T) {
	successCases := []struct {
		msg    string
		callID   string
	}{
		{inviteMsg, "3848276298220188511@atlanta.example.com"},
		{"", ""},
	}

	for _, c := range successCases {
		sip := Parser{
			models.SIP{
				Raw: &c.msg,
			}}

        sip.ParseCallID()

		assert.Equal(t, c.callID, sip.CallID)
	}
}
