import React, { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Routes, Route, Outlet, useNavigate } from 'react-router-dom'
import { Authenticator } from '@aws-amplify/ui-react'
import { AuthUser } from 'aws-amplify/auth'
import IndexPage from './app/main'
import UserPage from './user/index'
import RegionPage from './user/region'
import AccountPage from './user/account'
import QuestPage from './user/quest'
import CreateQuestPage from './user/quest/create'
import QuestDetailPage from './components/QuestDetailPage'

const queryClient = new QueryClient()

function ProtectedLayout({ user }: { user: AuthUser | undefined }) {
  const navigate = useNavigate()
  const [redirected, setRedirected] = useState(false)

  useEffect(() => {
    if (user && !redirected) {
      navigate('/user', { replace: true })
      setRedirected(true)
    }
  }, [user, redirected, navigate])

  if (!user) return <div>Loading...</div>

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  )
}

export default function App() {
  // const [authChecked, setAuthChecked] = useState(false)

  return (
    <Routes>
      {/* Public page */}
      <Route path="/" element={<IndexPage />} />

      {/* Protected routes */}
      <Route
        path="/user/*"
        element={
          <Authenticator>
            {({ user }) => {
              // Instead of `return null`, render a simple placeholder
              if (user === undefined) return <div>Loading...</div>

              return <ProtectedLayout user={user} />
            }}
          </Authenticator>
        }
      >
        <Route path="" element={<UserPage />} />
        <Route path="region" element={<RegionPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="home" element={<QuestPage />} />
        <Route path="quest/:id" element={<QuestDetailPage />} />
        <Route path="quest/create" element={<CreateQuestPage />} />
      </Route>
    </Routes>
  )
}
