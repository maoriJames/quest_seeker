import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import IndexPage from './app/main'
// import SignInPage from './auth/index'
import UserPage from './user/index'
import RegionPage from './user/region'
import './index.css'
import { Amplify } from 'aws-amplify'
import outputs from '../amplify_outputs.json'

Amplify.configure(outputs)

const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <Authenticator>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/user/region" element={<RegionPage />} />
        </Routes>
      </BrowserRouter>
    </Authenticator>
  </React.StrictMode>
)
