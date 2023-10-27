import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
//import 'normalize.css'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'
const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
    },
    {
        path: '/call',
        element: <div>settings</div>,
    },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
)
