export interface BaseType {
    SIPCallID: string
    SIPMethod: string
    CreateTime: string
    ToUser: string
    LegUid: string
    FromUser: string
    FsCallID: string
    ResponseCode: number
    ResponseDesc: string
    CSeqMethod: string
    CSeqNumber: number
    FromHost: string
    ToHost: string
    SIPProtocol: number
    IsRequest: number
    UserAgent: string
    SrcHost: string
    DstHost: string
    TimestampMicro: number
    RawMsg: string
}

export interface DataType extends BaseType {
    MsgCount: number
}
