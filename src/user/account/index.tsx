import bg from '@/assets/images/background_main.png'
import UpdateAccount from '@/components/UpdateAccount'
import MyQuests from '@/components/MyQuests'
import ExpiredQuests from '@/components/ExpiredQuests'
import { useCurrentUserProfile, useUpdateProfile } from '@/hooks/userProfiles'
import { useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { isProfileComplete } from '@/tools/profileValidation'
import { toProfileRole } from '@/hooks/toProfileTole'
import type { Profile } from '@/types'
// import type { UpdateProfileInput } from '@/graphql/API'
import { useState } from 'react'

export default function AccountPage() {
  const { data: currentProfile, isLoading } = useCurrentUserProfile()
  const updateProfile = useUpdateProfile()
  const location = useLocation()

  const defaultTab = (
    location.state as {
      defaultTab?: 'account' | 'my-quests' | 'expired-quests'
    }
  )?.defaultTab

  const [activeTab, setActiveTab] = useState<
    'account' | 'my-quests' | 'expired-quests'
  >(defaultTab || 'account')

  // if (isLoading || !currentProfile) return null

  // const isComplete = isProfileComplete(currentProfile)

  const confirmLeaveIfIncomplete = () => {
    if (!isComplete) {
      return window.confirm(
        'Your profile is incomplete. Please fill in all required fields before leaving this page.',
      )
    }
    return true
  }

  // 🔜 Phase 3: Replace with UserQuest cleanup logic
  // Previously cleaned up deleted quests from my_quests JSON blob
  // Will need to instead delete UserQuest items where quest no longer exists
  // useEffect(() => {
  //   if (!currentProfile?.my_quests?.length) return
  //   ... cleanup logic ...
  // }, [currentProfile?.id])

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
      className="min-h-screen flex flex-col items-center justify-start bg-cover bg-center py-8"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          className={cn(
            'px-4 py-2 rounded transition-colors',
            activeTab === 'account'
              ? 'bg-yellow-500 text-black hover:bg-yellow-600'
              : 'bg-gray-800 text-gray-300 hover:bg-yellow-500 hover:text-black',
          )}
          onClick={() => setActiveTab('account')}
        >
          My Account
        </button>

        <button
          className={cn(
            'px-4 py-2 rounded transition-colors',
            activeTab === 'my-quests'
              ? 'bg-yellow-500 text-black hover:bg-yellow-600'
              : 'bg-gray-800 text-gray-300 hover:bg-yellow-500 hover:text-black',
          )}
          onClick={() => {
            if (!confirmLeaveIfIncomplete()) return
            setActiveTab('my-quests')
          }}
        >
          My Quests
        </button>
      </div>

      {/* Content */}
      <div className="w-full max-w-3xl">
        {activeTab === 'account' && (
          <UpdateAccount
            profile={currentProfile}
            onUpdate={handleUpdate}
            isProfileComplete={isComplete}
          />
        )}

        {activeTab === 'my-quests' && <MyQuests profile={currentProfile} />}

        {activeTab === 'expired-quests' && (
          <ExpiredQuests profile={currentProfile} />
        )}
      </div>
    </div>
  )
}
