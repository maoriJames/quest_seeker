import { ProfileRole } from '@/graphql/API'
import type { Role } from '@/types'

export function toProfileRole(role: Role | undefined): ProfileRole | null {
  switch (role) {
    case 'seeker':
      return ProfileRole.seeker
    case 'creator':
      return ProfileRole.creator
    case 'admin':
      return ProfileRole.admin
    default:
      return null
  }
}
