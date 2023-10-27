import React from 'react'
import { Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Link } from 'react-router-dom'

interface DataType {
    time: string
    callerNo: string
    callerDomain: string
    calleeNo: string
    calleeDomain: string
    userAgent: string
    sipCallID: string
    msgCount: number
}

const columns: ColumnsType<DataType> = [
    {
        title: 'Time',
        dataIndex: 'time',
        key: 'time',
    },
    {
        title: 'CallID',
        dataIndex: 'sipCallID',
        key: 'sipCallID',
    },
    {
        title: 'Caller No.',
        dataIndex: 'callerNo',
        key: 'callerNo',
    },
    {
        title: 'Caller Domain',
        dataIndex: 'callerDomain',
        key: 'callerDomain',
    },
    {
        title: 'Callee No.',
        dataIndex: 'calleeNo',
        key: 'calleeNo',
    },
    {
        title: 'Callee Domain',
        dataIndex: 'calleeDomain',
        key: 'calleeDomain',
    },
    {
        title: 'User Agent',
        dataIndex: 'userAgent',
        key: 'userAgent',
    },
    {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
            <Space size="middle">
                <Link to={'/call/' + record.time.substring(0, 10) + '/' + record.sipCallID}>Sequence Diagram</Link>
            </Space>
        ),
    },
]

const data: DataType[] = [
    {
        time: '2010-10-10 10:10:10',
        callerNo: '8001',
        callerDomain: 'test.cc',
        calleeNo: '8002',
        calleeDomain: 'test.cc',
        userAgent: 'MicroSIP',
        sipCallID: '8389238293800990',
        msgCount: 10,
    },
]

const App: React.FC = () => <Table columns={columns} dataSource={data} rowKey="sipCallID" />

export default App
