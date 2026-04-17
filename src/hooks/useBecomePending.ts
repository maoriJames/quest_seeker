// hooks/useCreatorApplication.ts
import { useState } from 'react'
import type { Profile } from '@/types'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'

const client = generateClient<Schema>()

interface BankDetails {
  accountName: string
  accountNumber: string
}

export function useBecomePending() {
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitApplication = async (
    profile: Profile,
    bankDetails: BankDetails,
    isProfileComplete: boolean,
    onProfileUpdate: (updates: Partial<Profile>) => void,
  ) => {
    setIsSending(true)
    setError(null)

    try {
      const type = isProfileComplete
        ? 'BANK_ACCOUNT_UPDATE'
        : 'CREATOR_APPLICATION'

      // Call your becomePending function
      const { data, errors } = await client.mutations.becomePending({
        type,
        userId: profile.id,
        accountName: bankDetails.accountName,
        bankAccount: bankDetails.accountNumber,
        profileData: JSON.stringify(profile), // Stringify if needed
      })

      if (errors || !data) {
        throw new Error(errors?.[0]?.message || 'Failed to submit')
      }

      // Update role to 'pending' if coming from 'seeker' and submitting full application
      if (type === 'CREATOR_APPLICATION' && profile.role === 'seeker') {
        onProfileUpdate({ role: 'pending' })
      }

      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsSending(false)
    }
  }

  return { submitApplication, isSending, error }
}
