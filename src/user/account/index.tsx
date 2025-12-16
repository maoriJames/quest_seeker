import bg from '@/assets/images/background_main.png'
import UpdateAccount from '@/components/UpdateAccount'
import MyQuests from '@/components/MyQuests'
import { useCurrentUserProfile, useUpdateProfile } from '@/hooks/userProfiles'
import { useState, useEffect } from 'react'
import type { Profile, MyQuest } from '@/types'
import { UpdateProfileInput } from '@/graphql/API'
import { toProfileRole } from '@/hooks/toProfileTole'
import { generateClient } from 'aws-amplify/api'
import { getQuest } from '@/graphql/queries'
import { useLocation } from 'react-router-dom'
import ExpiredQuests from '@/components/ExpiredQuests'
import { cn } from '@/lib/utils'

const client = generateClient()

export default function AccountPage() {
  const { currentProfile } = useCurrentUserProfile()
  const { mutate: updateProfile } = useUpdateProfile()
  const location = useLocation()
  const [profileData, setProfileData] = useState<Profile>({
    id: '',
    full_name: '',
    email: '',
    organization_name: '',
    registration_number: '',
    business_type: '',
    organization_description: '',
    primary_contact_name: '',
    primary_contact_position: '',
    primary_contact_phone: '',
    about_me: '',
    secondary_contact_name: '',
    secondary_contact_position: '',
    secondary_contact_phone: '',
    image: '',
    image_thumbnail: '',
    role: 'seeker',
    my_quests: [],
    points: 0,
  })

  const defaultTab = (
    location.state as {
      defaultTab?: 'account' | 'my-quests' | 'expired-quests'
    }
  )?.defaultTab

  const [activeTab, setActiveTab] = useState<
    'account' | 'my-quests' | 'expired-quests'
  >(defaultTab || 'account')

  // 🧠 Load current profile into local state
  useEffect(() => {
    if (!currentProfile) return

    const quests = Array.isArray(currentProfile.my_quests)
      ? currentProfile.my_quests
      : currentProfile.my_quests
        ? JSON.parse(currentProfile.my_quests)
        : []

    setProfileData({
      id: currentProfile.id,
      full_name: currentProfile.full_name ?? '',
      email: currentProfile.email ?? '',
      organization_name: currentProfile.organization_name ?? '',
      registration_number: currentProfile.registration_number ?? '',
      business_type: currentProfile.business_type ?? '',
      organization_description: currentProfile.organization_description ?? '',
      primary_contact_name: currentProfile.primary_contact_name ?? '',
      primary_contact_position: currentProfile.primary_contact_position ?? '',
      primary_contact_phone: currentProfile.primary_contact_phone ?? '',
      about_me: currentProfile.about_me ?? '',
      secondary_contact_name: currentProfile.secondary_contact_name ?? '',
      secondary_contact_position:
        currentProfile.secondary_contact_position ?? '',
      secondary_contact_phone: currentProfile.secondary_contact_phone ?? '',
      image: currentProfile.image ?? '',
      image_thumbnail: currentProfile.image_thumbnail ?? '',
      role: currentProfile.role ?? 'seeker',
      my_quests: quests,
      points: currentProfile.points ?? 0,
    })
  }, [currentProfile])

  // 🧹 Clean up deleted quests
  useEffect(() => {
    const cleanUpDeletedQuests = async () => {
      if (!profileData?.my_quests?.length) return

      try {
        const questsStatus = await Promise.all(
          profileData.my_quests.map(async (quest) => {
            try {
              const result = await client.graphql({
                query: getQuest,
                variables: { id: quest.quest_id },
                authMode: 'userPool',
              })
              return result.data?.getQuest ? quest : null
            } catch {
              console.warn(`Quest ${quest.quest_id} not found, removing.`)
              return null
            }
          })
        )

        const validQuests: MyQuest[] = questsStatus.filter(Boolean) as MyQuest[]

        if (validQuests.length !== profileData.my_quests.length) {
          setProfileData((prev) => ({ ...prev, my_quests: validQuests }))

          const input: UpdateProfileInput = {
            id: profileData.id,
            my_quests: JSON.stringify(validQuests),
          }
          updateProfile({ input })
        }
      } catch (err) {
        console.error('Error cleaning up deleted quests:', err)
      }
    }

    if (profileData.id) cleanUpDeletedQuests()
  }, [profileData.id])

  // 🧩 Generic profile update handler
  const handleUpdate = (updates: Partial<Profile>) => {
    if (!profileData.id) return

    const merged = { ...profileData, ...updates }

    setProfileData(merged)

    const input: UpdateProfileInput = {
      id: merged.id,
      full_name: merged.full_name,
      email: merged.email,
      organization_name: merged.organization_name,
      registration_number: merged.registration_number,
      business_type: merged.business_type,
      organization_description: merged.organization_description,
      primary_contact_name: merged.primary_contact_name,
      primary_contact_position: merged.primary_contact_position,
      primary_contact_phone: merged.primary_contact_phone,
      about_me: merged.about_me,
      secondary_contact_name: merged.secondary_contact_name,
      secondary_contact_position: merged.secondary_contact_position,
      secondary_contact_phone: merged.secondary_contact_phone,
      image: merged.image,
      image_thumbnail: merged.image_thumbnail,
      role: toProfileRole(merged.role),
    }

    updateProfile({ input })
  }

  // ✅ Render
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start bg-cover bg-center py-8"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Tab buttons */}
      <div className="flex gap-2 mb-6">
        <button
          className={cn(
            'px-4 py-2 rounded transition-colors',
            activeTab === 'account'
              ? 'bg-yellow-500 text-black hover:bg-yellow-600'
              : 'bg-gray-800 text-gray-300 hover:bg-yellow-500 hover:text-black'
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
              : 'bg-gray-800 text-gray-300 hover:bg-yellow-500 hover:text-black'
          )}
          onClick={() => setActiveTab('my-quests')}
        >
          My Quests
        </button>
      </div>

      {/* Tab content */}
      <div className="w-full max-w-3xl">
        {activeTab === 'account' && (
          <UpdateAccount profile={profileData} onUpdate={handleUpdate} />
        )}
        {activeTab === 'my-quests' && <MyQuests profile={profileData} />}
        {activeTab === 'expired-quests' && (
          <ExpiredQuests profile={profileData} />
        )}
      </div>
    </div>
  )
}
