import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react'

import IndexPage from './app/main'
import UserPage from './user/index'
import RegionPage from './user/region'
import AccountPage from './user/account'
import QuestPage from './user/quest'
import CreateQuestPage from './user/quest/create'
import QuestDetailPage from './components/QuestDetailPage'
import Help from './user/help'
import Leader from './user/leader'
import logo from '@/assets/images/no_ordinary.png'

import { useEffect } from 'react'
import Legal from './user/legal'
import { useCurrentUserProfile } from './hooks/userProfiles'

const queryClient = new QueryClient()

function UserRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserRoutesInner />
    </QueryClientProvider>
  )
}

function UserRoutesInner() {
  const navigate = useNavigate()
  const { data: currentProfile } = useCurrentUserProfile()

  useEffect(() => {
    if (!currentProfile) return

    const isEmailAsName =
      currentProfile.full_name?.includes('@') ||
      !currentProfile.full_name?.trim()

    if (isEmailAsName) {
      navigate('/user/account', {
        state: { defaultTab: 'account', forceNameUpdate: true },
      })
    }
  }, [currentProfile])

  return (
    <Routes>
      <Route path="" element={<UserPage />} />
      <Route path="home" element={<QuestPage />} />
      <Route path="region" element={<RegionPage />} />
      <Route path="account" element={<AccountPage />} />
      <Route path="quest/create" element={<CreateQuestPage />} />
      <Route path="quest/:id" element={<QuestDetailPage />} />
      <Route path="quest/:id/edit" element={<CreateQuestPage />} />
      <Route path="leader" element={<Leader />} />
      <Route path="help" element={<Help />} />
      <Route path="auth/*" element={<Navigate to="/user/region" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public landing */}
      <Route path="/" element={<IndexPage />} />
      <Route path="/help" element={<Help />} />
      <Route path="legal" element={<Legal />} />
      {/* Protected area */}
      <Route
        path="/user/*"
        element={
          <Authenticator components={components} formFields={formFields}>
            {({ user }) => {
              return user ? <UserRoutes /> : <div>Loading...</div>
            }}
          </Authenticator>
        }
      />
    </Routes>
  )
}

const components = {
  Header() {
    return (
      <div className="w-full bg-white rounded-t-2xl flex flex-col items-center justify-center py-8 px-6 gap-3">
        <img
          src={logo}
          alt="QuestSeeker"
          className="w-full max-h-20 object-contain px-8"
        />

        <a
          href="/help"
          className="text-yellow-400 text-sm font-medium underline hover:text-yellow-300"
        >
          QuestSeeker in a nutshell →
        </a>
      </div>
    )
  },

  Footer() {
    const { toSignUp } = useAuthenticator()
    return (
      <div className="flex flex-col items-center gap-3 py-4 px-6">
        <div className="w-full flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
          <span className="text-sm text-gray-600">
            Running an event or fundraiser?
          </span>
          <button
            onClick={toSignUp}
            className="text-sm text-yellow-600 font-semibold hover:text-yellow-700 whitespace-nowrap"
          >
            Create a Quest →
          </button>
        </div>

        <div className="flex gap-4 text-xs text-gray-400">
          <a href="/legal" className="hover:text-gray-600">
            Terms of use
          </a>
          <a href="/legal?tab=privacy" className="hover:text-gray-600">
            Privacy policy
          </a>
          <a href="#" className="hover:text-gray-600">
            Support
          </a>
        </div>
      </div>
    )
  },

  SignIn: {
    Footer() {
      const { toSignUp } = useAuthenticator()
      return (
        <div className="flex flex-col items-center gap-2 pb-4">
          <p className="text-sm text-gray-600">
            No account?{' '}
            <button
              onClick={toSignUp}
              className="text-yellow-600 font-semibold hover:text-yellow-700"
            >
              Create one — it's free
            </button>
          </p>
        </div>
      )
    },
  },
}

const formFields = {
  signIn: {
    username: {
      label: 'Email',
      placeholder: 'you@example.com',
    },
    password: {
      label: 'Password',
      placeholder: '••••••••',
    },
  },
  signUp: {
    email: {
      label: 'Email',
      placeholder: 'you@example.com',
      order: 1,
    },
    password: {
      label: 'Password',
      order: 2,
    },
    confirm_password: {
      label: 'Confirm Password',
      order: 3,
    },
  },
}
