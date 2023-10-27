import React from 'react'
import { Button, Form, Input, DatePicker, TimePicker } from 'antd'

const onFinish = (values: any) => {
    console.log('Success:', values)
}

const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo)
}

type FieldType = {
    caller?: string
    callerDomain?: string
    callee?: string
    calleeDomain?: string
    datePicker?: string
    timePicker?: string
}

const App: React.FC = () => (
    <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
    >
        <Form.Item<FieldType> label="Caller No." name="caller">
            <Input />
        </Form.Item>

        <Form.Item<FieldType> label="Caller Domain" name="callerDomain">
            <Input />
        </Form.Item>

        <Form.Item<FieldType> label="Callee No." name="callee">
            <Input />
        </Form.Item>

        <Form.Item<FieldType> label="Callee Domain" name="calleeDomain">
            <Input />
        </Form.Item>

        <Form.Item label="DatePicker" name="datePicker" rules={[{ required: true, message: 'Please Select Date!' }]}>
            <DatePicker />
        </Form.Item>

        <Form.Item
            label="TimePicker"
            name="timerPicker"
            rules={[{ required: true, message: 'Please Select time range!' }]}
        >
            <TimePicker.RangePicker />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
                Search
            </Button>
        </Form.Item>
    </Form>
)

export default App
