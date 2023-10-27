import { Row, Col, Card } from 'antd'
import SearchForm from './SearchFrom'
import SearchTable from './SearchTable'

function App() {
    return (
        <Row gutter={16}>
            <Col span={6}>
                <Card title="Search Card">
                    <SearchForm />
                </Card>
            </Col>
            <Col span={18}>
                <SearchTable />
            </Col>
        </Row>
    )
}

export default App
