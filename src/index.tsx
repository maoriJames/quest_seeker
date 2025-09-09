import React from 'react'
import ReactDOM from 'react-dom/client'
import IndexPage from './app/main' // your component
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <IndexPage />
  </React.StrictMode>
)
