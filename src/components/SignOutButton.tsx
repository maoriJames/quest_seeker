import { signOut } from '@aws-amplify/auth'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

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
    <>
      <Button
        size="icon"
        variant="ghost"
        className="flex items-center justify-center h-auto w-auto p-0 bg-transparent hover:bg-transparent"
        onClick={handleSignOut}
      >
        <LogOut />
      </Button>
    </>
  )
}
