import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import { useCurrentUserProfile } from '@/hooks/userProfiles'

const client = generateClient<Schema>()

export function useBecomePending() {
  const { data: currentProfile, isLoading } = useCurrentUserProfile()

  const becomePending = async () => {
    if (isLoading) {
      throw new Error('Profile still loading')
    }

    if (!currentProfile?.id) {
      throw new Error('Profile not available')
    }

    await client.mutations.becomePending({
      profileId: currentProfile.id,
    })
  }

  return {
    becomePending,
    currentProfile,
    isLoading,
  }
}
