/**
* Homer Encapsulation Protocol v3
* Courtesy of Weave Communications, Inc (http://getweave.com/) under the ISC license (https://en.wikipedia.org/wiki/ISC_license)
**/

package hep

import (
	"encoding/binary"
	"errors"
	"fmt"
	"net"
)

// HEP ID
const (
	HEPID1 = 0x011002
	HEPID2 = 0x021002
	HEPID3 = 0x48455033
)

// Generic Chunk Types
const (
	_ = iota // Don't want to assign zero here, but want to implicitly repeat this expression after...
	IPProtocolFamily
	IPProtocolID
	IP4SourceAddress
	IP4DestinationAddress
	IP6SourceAddress
	IP6DestinationAddress
	SourcePort
	DestinationPort
	Timestamp
	TimestampMicro
	ProtocolType // Maps to Protocol Types below
	CaptureAgentID
	KeepAliveTimer
	AuthenticationKey
	PacketPayload
	CompressedPayload
	InternalC
)

// HepMsg represents a parsed HEP packet
type HepMsg struct {
	IPProtocolFamily      byte
	IPProtocolID          byte
	IP4SourceAddress      string
	IP4DestinationAddress string
	IP6SourceAddress      string
	IP6DestinationAddress string
	SourcePort            uint16
	DestinationPort       uint16
	Timestamp             uint32
	TimestampMicro        uint32
	ProtocolType          byte
	CaptureAgentID        uint16
	KeepAliveTimer        uint16
	AuthenticateKey       string
	Body                  string
}

// NewHepMsg returns a parsed message object. Takes a byte slice.
func NewHepMsg(packet []byte) (*HepMsg, error) {
	newHepMsg := &HepMsg{}
	err := newHepMsg.parse(packet)
	if err != nil {
		return nil, err
	}
	return newHepMsg, nil
}

func (hepMsg *HepMsg) parse(udpPacket []byte) error {

	switch udpPacket[0] {
	case 0x48:
		return hepMsg.parseHep3(udpPacket)
	default:
		err := errors.New("Not a valid HEP packet - HEP ID does not match spec")
		return err
	}
}

func (hepMsg *HepMsg) parseHep3(udpPacket []byte) error {
	length := binary.BigEndian.Uint16(udpPacket[4:6])
	currentByte := uint16(6)

	for currentByte < length {
		hepChunk := udpPacket[currentByte:]
		chunkType := binary.BigEndian.Uint16(hepChunk[2:4])
		chunkLength := binary.BigEndian.Uint16(hepChunk[4:6])

		if int(chunkLength) > cap(udpPacket) {
			return fmt.Errorf("chunkLength big then package size: chunkLength: %v, package size: %v", chunkLength, cap(udpPacket))
		}

		chunkBody := hepChunk[6:chunkLength]

		switch chunkType {
		case IPProtocolFamily:
			hepMsg.IPProtocolFamily = chunkBody[0]
		case IPProtocolID:
			hepMsg.IPProtocolID = chunkBody[0]
		case IP4SourceAddress:
			hepMsg.IP4SourceAddress = net.IP(chunkBody).String()
		case IP4DestinationAddress:
			hepMsg.IP4DestinationAddress = net.IP(chunkBody).String()
		case IP6SourceAddress:
			hepMsg.IP6SourceAddress = net.IP(chunkBody).String()
		case IP6DestinationAddress:
			hepMsg.IP4DestinationAddress = net.IP(chunkBody).String()
		case SourcePort:
			hepMsg.SourcePort = binary.BigEndian.Uint16(chunkBody)
		case DestinationPort:
			hepMsg.DestinationPort = binary.BigEndian.Uint16(chunkBody)
		case Timestamp:
			hepMsg.Timestamp = binary.BigEndian.Uint32(chunkBody)
		case TimestampMicro:
			hepMsg.TimestampMicro = binary.BigEndian.Uint32(chunkBody)
		case ProtocolType:
			hepMsg.ProtocolType = chunkBody[0]
		case CaptureAgentID:
			hepMsg.CaptureAgentID = binary.BigEndian.Uint16(chunkBody)
		case KeepAliveTimer:
			hepMsg.KeepAliveTimer = binary.BigEndian.Uint16(chunkBody)
		case AuthenticationKey:
			hepMsg.AuthenticateKey = string(chunkBody)
		case PacketPayload:
			hepMsg.Body += string(chunkBody)
		case CompressedPayload:
		case InternalC:
		default:
		}
		currentByte += chunkLength
	}
	return nil
}
