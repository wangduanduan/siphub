import { Row, Col, Card } from 'antd'
import { FieldType, SearchForm } from './SearchFrom'
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

    function Search(ft: FieldType) {
        console.log('app', ft)
        console.log(ft.timePicker)

        const query = {
            BeginTime: ft.datePicker.format('YYYY-MM-DD') + ' ' + ft.timePicker[0].format('HH:mm:ss'),
            EndTime: ft.datePicker.format('YYYY-MM-DD') + ' ' + ft.timePicker[0].format('HH:mm:ss'),
            Caller: !!ft.caller ? ft.caller : undefined,
            CallerDomain: ft.callerDomain,
            // 被叫号码取反存储
            Callee: !!ft.callee ? ft.callee.split('').reverse().join('') : undefined,
            CalleeDomain: ft.calleeDomain,
        }

        console.log(query)
    }

    return (
        <Row gutter={16}>
            <Col span={6}>
                <Card title="Search Card">
                    <SearchForm search={Search} />
                </Card>
            </Col>
            <Col span={18}>
                <SearchTable calls={calls} />
            </Col>
        </Row>
    )
}

export default App
