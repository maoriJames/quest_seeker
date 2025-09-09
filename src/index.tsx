import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import IndexPage from './app/main'
// import SignInPage from './app/SignInPage'
import UserPage from './user/index'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        {/* <Route path="/sign-in" element={<SignInPage />} /> */}
        <Route path="/user" element={<UserPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
