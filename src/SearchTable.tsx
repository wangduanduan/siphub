import React from 'react'
import { Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Link } from 'react-router-dom'
import { DataType } from './interface'

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
                <Link target="blank" to={'/call/' + record.time.substring(0, 10) + '/' + record.sipCallID}>
                    Sequence Diagram
                </Link>
            </Space>
        ),
    },
]

interface Prop {
    calls: DataType[]
}

const App: React.FC<Prop> = ({ calls }) => <Table columns={columns} dataSource={calls} rowKey="sipCallID" />

export default App
