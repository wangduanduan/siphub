import { useParams } from 'react-router-dom'

export default function SequenceDiagram() {
    let params = useParams()
    console.log(params.day, params.callID)
    return (
        <div>
            {params.day} {params.callID}
        </div>
    )
}
