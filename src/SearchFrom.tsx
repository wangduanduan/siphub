import dayjs from 'dayjs'

import { Button, Form, Input, DatePicker, TimePicker } from 'antd'

export type FieldType = {
    caller?: string
    callerDomain?: string
    callee?: string
    calleeDomain?: string
    datePicker: dayjs.Dayjs
    timePicker: [dayjs.Dayjs, dayjs.Dayjs]
}

interface Prop {
    search: (ft: FieldType) => void
}

export function SearchForm(p: Prop) {
    const onFinish = (values: FieldType) => {
        console.log('Success:', values)
        p.search(values)
    }

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo)
    }

    return (
        <Form
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            initialValues={{ datePicker: dayjs(), timePicker: [dayjs().subtract(10, 'm'), dayjs()] }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
        >
            <Form.Item<FieldType>
                label="Caller No."
                name="caller"
                rules={[{ pattern: /(^\S)((.)*\S)?(\S*$)/, message: 'no any space allow!' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item<FieldType>
                label="Caller Domain"
                name="callerDomain"
                rules={[{ pattern: /(^\S)((.)*\S)?(\S*$)/, message: 'no any space allow!' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item<FieldType>
                label="Callee No."
                name="callee"
                rules={[{ pattern: /(^\S)((.)*\S)?(\S*$)/, message: 'no any space allow!' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item<FieldType>
                label="Callee Domain"
                name="calleeDomain"
                rules={[{ pattern: /(^\S)((.)*\S)?(\S*$)/, message: 'no any space allow!' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="DatePicker"
                name="datePicker"
                rules={[{ required: true, message: 'Please Select Date!' }]}
            >
                <DatePicker />
            </Form.Item>

            <Form.Item
                label="TimePicker"
                name="timePicker"
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
}
