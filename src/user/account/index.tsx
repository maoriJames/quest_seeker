import bg from '@/assets/images/background_main.png'
import UpdateAccount from '@/components/UpdateAccount'
// import MyQuests from '@/components/MyQuests'
// import ExpiredQuests from '@/components/ExpiredQuests'
import { useCurrentUserProfile, useUpdateProfile } from '@/hooks/userProfiles'
import { useLocation, useNavigate } from 'react-router-dom'
// import { cn } from '@/lib/utils'
import { isProfileComplete } from '@/tools/profileValidation'
import { toProfileRole } from '@/hooks/toProfileTole'
import type { Profile } from '@/types'
// import type { UpdateProfileInput } from '@/graphql/API'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Toolbar } from '@/components/Toolbar'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'
import SignOutButton from '@/components/SignOutButton'
import MyQuests from '@/components/MyQuests'

export default function AccountPage() {
  const { data: currentProfile, isLoading } = useCurrentUserProfile()
  const updateProfile = useUpdateProfile()
  const location = useLocation()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState(
    location.state?.defaultTab || 'account',
  )

  useEffect(() => {
    if (location.state?.defaultTab) {
      setActiveTab(location.state.defaultTab)
    }
  }, [location.state])

  // ✅ EARLY RETURN COMES AFTER ALL HOOKS
  if (isLoading || !currentProfile) return null

  const isComplete = isProfileComplete(currentProfile)

  const handleUpdate = async (updates: Partial<Profile>) => {
    await updateProfile.mutateAsync({
      input: {
        id: currentProfile.id,
        full_name: updates.full_name,
        email: updates.email,
        phone: updates.phone,
        organization_name: updates.organization_name,
        registration_number: updates.registration_number,
        charity_number: updates.charity_number,
        business_type: updates.business_type,
        organization_description: updates.organization_description,
        primary_contact_name: updates.primary_contact_name,
        primary_contact_position: updates.primary_contact_position,
        primary_contact_phone: updates.primary_contact_phone,
        about_me: updates.about_me,
        secondary_contact_name: updates.secondary_contact_name,
        secondary_contact_position: updates.secondary_contact_position,
        secondary_contact_phone: updates.secondary_contact_phone,
        image: updates.image,
        image_thumbnail: updates.image_thumbnail,
        role: toProfileRole(currentProfile.role),
      },
    })
  }

  return (
    <div
      className="relative h-screen flex items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl max-w-5xl w-full h-full max-h-full flex flex-col overflow-hidden">
        <CardContent className="flex flex-col gap-4 flex-1 min-h-0 p-0">
          <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md p-4 shadow-sm border-b">
            <Toolbar>
              <Button
                variant="yellow"
                onClick={() => navigate('/user/region')}
                size="icon"
              >
                <Home />
              </Button>

              {/* 3. Update onClick to set the state and add visual feedback */}
              <Button
                variant={activeTab === 'account' ? 'default' : 'yellow'}
                onClick={() => setActiveTab('account')}
              >
                My Account
              </Button>

              <Button
                variant={activeTab === 'my-quests' ? 'default' : 'yellow'}
                onClick={() => setActiveTab('my-quests')}
              >
                My Quests
              </Button>

              <Button variant="yellow" onClick={() => navigate('/user/leader')}>
                Leader Board
              </Button>

              <Button variant="yellow" onClick={() => navigate('/user/help')}>
                Help
              </Button>
              <SignOutButton />
            </Toolbar>
          </div>
          <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            <div className="w-full max-w-3xl mx-auto">
              {activeTab === 'account' && (
                <UpdateAccount
                  profile={currentProfile}
                  onUpdate={handleUpdate}
                  isProfileComplete={isComplete}
                />
              )}

              {activeTab === 'my-quests' && (
                <MyQuests profile={currentProfile} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
