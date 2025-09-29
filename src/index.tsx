import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import '@aws-amplify/ui-react/styles.css'
import IndexPage from './app/main'
import UserPage from './user/index'
import RegionPage from './user/region'
import AccountPage from './user/account'
import QuestPage from './user/quest'
import CreateQuestPage from './user/quest/create'
import QuestDetailPage from './components/QuestDetailPage'
import './index.css'
import { Amplify } from 'aws-amplify'
import outputs from '../amplify_outputs.json'
import { Authenticator } from '@aws-amplify/ui-react'

// import AppAuthenticator from './components/AppAuthenticator'

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
            <Route path="/user/region" element={<RegionPage />} />
            <Route path="/user/account" element={<AccountPage />} />
            <Route path="/user/home" element={<QuestPage />} />
            <Route path="/quest/:id" element={<QuestDetailPage />} />
            <Route path="/user/quest/create" element={<CreateQuestPage />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </Authenticator>
  </React.StrictMode>
)
