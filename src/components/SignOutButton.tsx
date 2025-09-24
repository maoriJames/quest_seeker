import { signOut } from '@aws-amplify/auth'

export default function SignOutButton() {
  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/user/auth' // redirect after signing out
    } catch (err) {
      console.error('Error signing out:', err)
    }
  }

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 bg-red-500 text-white rounded"
    >
      Sign Out
    </button>
  )
}
