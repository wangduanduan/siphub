import React from 'react'
import { Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Link } from 'react-router-dom'
import { DataType } from './interface'
import dayjs from 'dayjs'

const columns: ColumnsType<DataType> = [
    {
        title: 'Time',
        key: 'CreateTime',
        render: (_, record) => dayjs(record.CreateTime).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
        title: 'CallID',
        dataIndex: 'SIPCallID',
        key: 'SIPCallID',
    },
    {
        title: 'Caller No.',
        dataIndex: 'FromUser',
        key: 'FromUser',
    },
    {
        title: 'Caller Domain',
        dataIndex: 'FromHost',
        key: 'FromHost',
    },
    {
        title: 'Callee No.',
        dataIndex: 'ToUser',
        key: 'ToUser',
    },
    {
        title: 'Callee Domain',
        dataIndex: 'ToHost',
        key: 'ToHost',
    },
    {
        title: 'User Agent',
        dataIndex: 'UserAgent',
        key: 'UserAgent',
    },
    {
        title: 'Msg Count',
        dataIndex: 'MsgCount',
        key: 'MsgCount',
    },
    {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
            <Space size="middle">
                <Link target="blank" to={'/call/' + record.CreateTime.substring(0, 10) + '/' + record.SIPCallID + '/'}>
                    Sequence Diagram
                </Link>
            </Space>
        ),
    },
]

interface Prop {
    calls: DataType[]
}

const App: React.FC<Prop> = ({ calls }) => <Table columns={columns} dataSource={calls} rowKey="SIPCallID" />

export default App
