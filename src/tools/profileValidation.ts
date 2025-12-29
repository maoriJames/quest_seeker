// utils/profileValidation.ts
import type { Profile } from '@/types'

export function isProfileComplete(profile: Profile) {
  if (!profile.full_name?.trim()) return false
  // if (!profile.primary_contact_phone?.trim()) return false

  if (profile.role === 'creator') {
    if (!profile.organization_name?.trim()) return false
    if (!profile.business_type?.trim()) return false
  }

  return true
}
