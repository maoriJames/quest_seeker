import bg from '@/assets/images/background_main.png'
import UpdateAccount from '@/components/UpdateAccount'
import { useCurrentUserProfile, useUpdateProfile } from '@/hooks/userProfiles'
import { useLocation, useNavigate } from 'react-router-dom'
import { isProfileComplete } from '@/tools/profileValidation'
import { toProfileRole } from '@/hooks/toProfileTole'
import type { Profile } from '@/types'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Toolbar } from '@/components/Toolbar'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'
import SignOutButton from '@/components/SignOutButton'
import MyQuests from '@/components/MyQuests'
import CurrentUserStatus from '@/components/CurrentUserStatus'
import { useBecomePending } from '@/hooks/useBecomePending'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function AccountPage() {
  const { data: currentProfile, isLoading, refetch } = useCurrentUserProfile()
  const updateProfile = useUpdateProfile()
  const location = useLocation()
  const navigate = useNavigate()

  const { becomePending } = useBecomePending()
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [activeTab, setActiveTab] = useState(
    location.state?.defaultTab || 'account',
  )

  useEffect(() => {
    if (location.state?.defaultTab) {
      // 1. Set the active tab from the navigation state
      setActiveTab(location.state.defaultTab)
      refetch()
      // 2. Immediately wipe the state from the browser history
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, location.pathname, navigate])

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

  const handleClick = () => {
    if (!currentProfile) return

    // if (role === ProfileRole.creator) {
    //   navigate(to)
    // } else {
    setModalOpen(true)
    // }
  }

  const handleBecomeCreator = async () => {
    setLoading(true)
    try {
      await becomePending()
      setModalOpen(false)
      // Pass the state object here:
      navigate('/user/account', { state: { defaultTab: 'status' } })
    } catch (err) {
      console.error('Failed to become creator:', err)
      alert('Something went wrong — please try again.')
    } finally {
      setLoading(false)
    }
  }

  let buttonText = ''
  if (currentProfile.role == 'creator') buttonText = 'Creator'
  if (currentProfile.role == 'seeker') buttonText = 'Become a Quest Creator'
  if (currentProfile.role == 'pending') buttonText = 'Creator Status'
  return (
    <div
      className="relative h-screen flex items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl max-w-5xl w-full h-full max-h-full flex flex-col overflow-hidden">
        <CardContent className="flex flex-col gap-4 flex-1 min-h-0 p-0">
          <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-md p-4 shadow-sm border-b">
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
              {/* Button aligned to the right */}
              <div className="flex justify-end mb-6">
                <Button
                  variant={activeTab === 'status' ? 'default' : 'yellow'}
                  onClick={() => {
                    if (currentProfile.role === 'seeker') {
                      // Trigger the async logic if they aren't pending/creator yet
                      handleClick()
                    } else {
                      // Otherwise, just switch the tab view
                      setActiveTab('status')
                    }
                  }}
                >
                  {buttonText}
                </Button>
              </div>

              {/* Tab content */}
              {activeTab === 'status' && (
                <CurrentUserStatus
                  profile={currentProfile}
                  onUpdate={handleUpdate}
                  isProfileComplete={isComplete}
                />
              )}
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
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Become a Creator</DialogTitle>
            <DialogDescription>
              You are currently a Seeker. Only Creators may create quests. Would
              you like to upgrade your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBecomeCreator}
              disabled={loading || isLoading || !currentProfile}
            >
              {loading ? 'Updating...' : 'Become a Creator'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
