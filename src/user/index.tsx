import { Navigate } from 'react-router-dom'
import { useCurrentUserProfile } from '@/hooks/userProfiles'

export default function UserPage() {
  const { currentProfile, isLoading } = useCurrentUserProfile()

  // 🔹 While loading, don’t navigate yet
  if (isLoading || !currentProfile) {
    return null // or a spinner
  }

  // 🔹 Define which fields are required
  const requiredFields: (keyof typeof currentProfile)[] = [
    'full_name',
    'primary_contact_phone',
    // add more fields you want to require
  ]

  // 🔹 Check if any required field is missing
  const hasMissingFields = requiredFields.some(
    (field) =>
      !currentProfile[field] || currentProfile[field].toString().trim() === ''
  )

  return hasMissingFields ? (
    <Navigate to="/user/account" replace />
  ) : (
    <Navigate to="/user/region" replace />
  )
}
