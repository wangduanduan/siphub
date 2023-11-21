import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import SequenceDiagram from './SequenceDiagram'
import axios from 'axios'
//import 'normalize.css'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'
const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
    },
    {
        path: '/call/:day/:callID',
        element: <SequenceDiagram />,
        loader: async ({ params }) => {
            const res = await axios.get(`/api/v1/call/${params.day}/${params.callID}/`)
            return res.data
        },
    },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
)
