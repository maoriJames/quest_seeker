import { PostConfirmationTriggerHandler } from 'aws-lambda'
import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import type { Schema } from '../../data/resource'
import { env } from '$amplify/env/postRegistration'

// 🔐 Configure Amplify for Lambda runtime
const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env)

Amplify.configure(resourceConfig, libraryOptions)

// 📦 Typed Amplify Data client
const client = generateClient<Schema>()

export const handler: PostConfirmationTriggerHandler = async (event) => {
  const { sub, email } = event.request.userAttributes
  const fullName = email

  if (!email) {
    console.warn('No email found for user', sub)
    return event
  }

  try {
    await client.models.Profile.create({
      id: sub,
      email: email,
      owner: sub,
      full_name: fullName,
      role: 'seeker',
    })

    console.log('Profile created for user:', sub)
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.warn('Profile creation failed:', err.message)
    } else {
      console.warn('Profile creation failed with unknown error')
    }
  }

  return event
}
