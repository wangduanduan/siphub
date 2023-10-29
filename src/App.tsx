import { Row, Col, Card } from 'antd'
import SearchForm from './SearchFrom'
import SearchTable from './SearchTable'
import { useState } from 'react'
import { DataType } from './interface'

function App() {
    const [calls, setCalls] = useState<DataType[]>([
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
    ])

    return (
        <Row gutter={16}>
            <Col span={6}>
                <Card title="Search Card">
                    <SearchForm />
                </Card>
            </Col>
            <Col span={18}>
                <SearchTable calls={calls} />
            </Col>
        </Row>
    )
}

export default App
