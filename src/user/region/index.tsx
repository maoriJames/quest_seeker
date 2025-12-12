import { useState, useEffect } from 'react'
import PickRegion from '@/components/PickRegion'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import logo from '@/assets/images/logo_trans.png'
import bg from '@/assets/images/background_main.png'
import { useCurrentUserProfile } from '@/hooks/userProfiles'
import { signOut } from 'aws-amplify/auth'
import { LogOut } from 'lucide-react'

export default function RegionPage() {
  const [selectedRegion, setSelectedRegion] = useState('')
  const [seekerName, setSeekerName] = useState('')
  const { currentProfile, isLoading } = useCurrentUserProfile()

  const navigate = useNavigate()

  useEffect(() => {
    if (currentProfile?.full_name) {
      setSeekerName(currentProfile.full_name)
    }
  }, [currentProfile])

  const findQuests = () => {
    navigate(`/user/home?region=${encodeURIComponent(selectedRegion)}`)
  }

  const updateAccount = () => {
    navigate('/user/account')
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/user/auth' // redirect after signing out
    } catch (err) {
      console.error('Error signing out:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }
  // console.log({ currentProfile, isLoading, error: currentError })

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
        <CardContent>
          <p className="text-xl font-semibold mb-4">
            Welcome Back {seekerName || 'User'}!
          </p>

          <img
            src={logo}
            alt="logo"
            className="w-3/5 aspect-square mx-auto mb-6"
          />

          <PickRegion value={selectedRegion} onChange={setSelectedRegion} />

          <Button className="w-full mt-6" onClick={findQuests}>
            Show me quests
          </Button>
          <Button className="w-full mt-6" onClick={updateAccount}>
            Update Account
          </Button>
          <Button className="w-full mt-6" onClick={handleSignOut}>
            <LogOut />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
