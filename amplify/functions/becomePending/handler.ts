import type { Schema } from '../../data/resource'
import { updateUserRole } from './updateRole'
import { sendCreatorApplicationEmail, sendBankUpdateEmail } from './sendEmail'

type Role = 'seeker' | 'creator' | 'pending'

type Profile = {
  id: string
  full_name: string
  email: string
  phone: string
  organization_name: string
  registration_number: string
  charity_number: string
  business_type: string
  organization_description: string
  primary_contact_name: string
  primary_contact_position: string
  primary_contact_phone: string
  secondary_contact_name: string
  secondary_contact_position: string
  secondary_contact_phone: string
  about_me: string
  image: string
  image_thumbnail: string
  role: Role
  points: number
}

export const handler: Schema['becomePending']['functionHandler'] = async (
  event,
) => {
  const { type, userId, accountName, bankAccount, profileData } =
    event.arguments

  const isProfile = (data: any): data is Profile => {
    return data && typeof data === 'object' && 'role' in data
  }

  try {
    if (type === 'CREATOR_APPLICATION' && isProfile(profileData)) {
      // TypeScript now knows profileData has a .role property
      if (profileData.role === 'seeker') {
        await updateUserRole(userId, 'pending', process.env.PROFILE_TABLE_NAME!)
      }

      await sendCreatorApplicationEmail(
        userId,
        accountName,
        bankAccount,
        profileData,
      )
    } else if (type === 'BANK_ACCOUNT_UPDATE') {
      await sendBankUpdateEmail(
        userId,
        accountName,
        bankAccount,
        process.env.PROFILE_TABLE_NAME!,
      )
    }

    return { success: true, message: 'Application submitted successfully' }
  } catch (error) {
    console.error('Error in becomePending:', error)
    throw error
  }
}
