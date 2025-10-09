import bg from '@/assets/images/background_main.png'
import UpdateAccount from '@/components/UpdateAccount'
import { useCurrentUserProfile, useUpdateProfile } from '@/hooks/userProfiles'
import { useState, useEffect } from 'react'
import type { Profile } from '@/types'
import { UpdateProfileInput } from '@/graphql/API'
import { toProfileRole } from '@/hooks/toProfileTole'

export default function AccountPage() {
  const { currentProfile } = useCurrentUserProfile()
  const { mutate: updateProfile } = useUpdateProfile()

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
    secondary_contact_name: '',
    secondary_contact_position: '',
    secondary_contact_phone: '',
    image: '',
    role: 'seeker', // default
    my_quests: [],
  })

  // Load current profile into state
  useEffect(() => {
    if (!currentProfile) return
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
      secondary_contact_name: currentProfile.secondary_contact_name ?? '',
      secondary_contact_position:
        currentProfile.secondary_contact_position ?? '',
      secondary_contact_phone: currentProfile.secondary_contact_phone ?? '',
      image: currentProfile.image ?? '',
      role: currentProfile.role ?? 'seeker',
      my_quests: Array.isArray(currentProfile.my_quests)
        ? currentProfile.my_quests
        : currentProfile.my_quests
          ? JSON.parse(currentProfile.my_quests) // parse string to array
          : [], // default empty array
    })
  }, [currentProfile])

  // 🔹 Fully typed, type-safe update handler
  const handleUpdate = (updates: Partial<Profile>) => {
    if (!profileData.id) return

    // 1️⃣ Optimistic update
    setProfileData((prev) => ({
      ...prev,
      ...updates,
    }))

    // 2️⃣ Prepare GraphQL input
    const input: UpdateProfileInput = {
      id: profileData.id,
      full_name: updates.full_name ?? profileData.full_name,
      email: updates.email ?? profileData.email,
      organization_name:
        updates.organization_name ?? profileData.organization_name,
      registration_number:
        updates.registration_number ?? profileData.registration_number,
      business_type: updates.business_type ?? profileData.business_type,
      organization_description:
        updates.organization_description ??
        profileData.organization_description,
      primary_contact_name:
        updates.primary_contact_name ?? profileData.primary_contact_name,
      primary_contact_position:
        updates.primary_contact_position ??
        profileData.primary_contact_position,
      primary_contact_phone:
        updates.primary_contact_phone ?? profileData.primary_contact_phone,
      secondary_contact_name:
        updates.secondary_contact_name ?? profileData.secondary_contact_name,
      secondary_contact_position:
        updates.secondary_contact_position ??
        profileData.secondary_contact_position,
      secondary_contact_phone:
        updates.secondary_contact_phone ?? profileData.secondary_contact_phone,
      image: updates.image ?? profileData.image,
      role: toProfileRole(updates.role ?? profileData.role), // type-safe
    }

    // 3️⃣ Call backend
    updateProfile({ input })
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <UpdateAccount profile={profileData} onUpdate={handleUpdate} />
    </div>
  )
}
