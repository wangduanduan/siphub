import { useLoaderData } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { Tabs } from 'antd'
import type { TabsProps } from 'antd'
import { Col, Row, Card, Tag } from 'antd'
import './Sequence.css'

const onChange = (key: string) => {
    console.log(key)
}

import * as ssd from 'svg-sequence-diagram'
import { data } from './flow'
import { createSeqHtml, formatLongTime, getProtocolName } from './util'
import { BaseType } from './interface'
import $ from 'jquery'
import { lineColors } from './config'

function paintLine(pid: string, flow: BaseType[]) {
    $(`#${pid} g.region:has(polygon)`).each(function (this: HTMLElement, index: number) {
        const color = lineColors[flow[index].CSeqNumber % lineColors.length]
        console.log(color)
        $(this).find('path').first().css('stroke', color)
        $(this).find('polygon').css('fill', color)
        $(this).find('text').css('fill', color)
    })
}

export default function SequenceDiagram() {
    // const params = useParams()
    const ssdRef = useRef<HTMLDivElement>(null)
    // const [flow, setFLow] = useState<string>(createSeqHtml(data, 0).html)
    // const [seq, setSeq] = useState<BaseType[]>([])
    const [seqHeight, _] = useState(window.innerHeight)
    const seq = useLoaderData() as BaseType[]

    const seqList = seq.map((item, index) => {
        return (
            <Card
                key={item.ID}
                id={'s-line-' + (index + 1)}
                title={`[${index + 1}]  ${item.SIPMethod} ${formatLongTime(item.CreateTime)}`}
                bordered={true}
            >
                <p>
                    <Tag color="magenta">length: {item.RawMsg.length}B</Tag>
                    <Tag color="cyan">protocol: {getProtocolName(item.SIPProtocol)}</Tag>
                </p>
                <div>
                    <pre style={{ overflowX: 'scroll' }}>{item.RawMsg}</pre>
                </div>
            </Card>
        )
    })

    const items: TabsProps['items'] = [
        {
            key: 'leg-a',
            label: 'Leg A',
            children: (
                <Row>
                    <Col span={12}>
                        <div id="leg-a" ref={ssdRef}></div>
                    </Col>
                    <Col span={12} style={{ height: seqHeight, overflowY: 'scroll' }}>
                        {seqList}
                    </Col>
                </Row>
            ),
        },
        {
            key: 'leg-b',
            label: 'Leg B',
            children: 'Content of Tab Pane 2',
        },
    ]

    // useEffect(() => {
    //     axios
    //         .get(`/api/v1/call/${params.day}/${params.callID}/`)
    //         .then((res) => {
    //             res.data
    //             setSeq(res.data)
    //         })
    //         .catch()
    // }, [])

    useEffect(() => {
        const diagram = new ssd.SequenceDiagram()
        const dom = createSeqHtml(seq, 0).html
        diagram.set(dom)
        diagram.addEventListener('click', (e: any) => {
            if (e.type === 'connect') {
                console.log(e)
                diagram.setHighlight(e.ln)
                let cid = 's-line-' + e.ln
                let el = document.getElementById(cid)
                if (el) el.scrollIntoView()
            }
        })

        if (ssdRef.current !== null) {
            ssdRef.current.appendChild(diagram.dom())
            paintLine('leg-a', data)
        }
        return () => {
            diagram.removeAllEventListeners()
            if (ssdRef.current) ssdRef.current.innerHTML = ''
        }
    }, [seq])

    return (
        <div>
            {/* {params.day} {params.callID} */}
            <Tabs defaultActiveKey="leg-a" centered items={items} onChange={onChange} />
        </div>
    )
}
