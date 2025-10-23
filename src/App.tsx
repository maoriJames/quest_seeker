import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Routes, Route } from 'react-router-dom'
import { Authenticator } from '@aws-amplify/ui-react'
// import { AuthUser } from 'aws-amplify/auth'

import IndexPage from './app/main'
import UserPage from './user/index'
import RegionPage from './user/region'
import AccountPage from './user/account'
import QuestPage from './user/quest'
import CreateQuestPage from './user/quest/create'
import QuestDetailPage from './components/QuestDetailPage'

const queryClient = new QueryClient()

function UserRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        {/* all of these are relative to /user */}
        <Route path="" element={<UserPage />} />
        <Route path="region" element={<RegionPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="home" element={<QuestPage />} />
        <Route path="quest/create" element={<CreateQuestPage />} />
        <Route path="quest/:id" element={<QuestDetailPage />} />
      </Routes>
    </QueryClientProvider>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public landing */}
      <Route path="/" element={<IndexPage />} />

      {/* Protected area */}
      <Route
        path="/user/*"
        element={
          <Authenticator>
            {({ user }) => (user ? <UserRoutes /> : <div>Loading...</div>)}
          </Authenticator>
        }
      />
    </Routes>
  )
}
