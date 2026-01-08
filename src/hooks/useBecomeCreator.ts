import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import { useCurrentUserProfile } from '@/hooks/userProfiles'

const client = generateClient<Schema>()

export function useBecomeCreator() {
  const { data: currentProfile, isLoading } = useCurrentUserProfile()

  const becomeCreator = async () => {
    if (isLoading) {
      throw new Error('Profile still loading')
    }

    if (!currentProfile?.id) {
      throw new Error('Profile not available')
    }

    await client.mutations.becomeCreator({
      profileId: currentProfile.id,
    })
  }

  return {
    becomeCreator,
    currentProfile,
    isLoading,
  }
}
