import { signOut } from '@aws-amplify/auth'
import { Button } from '@/components/ui/button'

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
    <Button onClick={handleSignOut} className="w-full mt-6">
      Sign Out
    </Button>
  )
}
