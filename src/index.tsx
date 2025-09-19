import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import IndexPage from './app/main'
// import SignInPage from './auth/index'
import UserPage from './user/index'
// import RegionPage from './user/region'
import AccountPage from './user/account'
import './index.css'
import { Amplify } from 'aws-amplify'
import outputs from '../amplify_outputs.json'

Amplify.configure(outputs)
// Create a single QueryClient instance
const queryClient = new QueryClient()
const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <Authenticator>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/user" element={<UserPage />} />
            {/* <Route path="/user/region" element={<RegionPage />} /> */}
            <Route path="/user/account" element={<AccountPage />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </Authenticator>
  </React.StrictMode>
)
