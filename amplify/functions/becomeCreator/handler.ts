import type { AppSyncResolverEvent } from 'aws-lambda'
import type { Schema } from '../../data/resource'

import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { env } from '$amplify/env/becomeCreator'

// Local structural type (Amplify does not export this yet)
// type DataClientEnvShape = {
//   AWS_ACCESS_KEY_ID: string
//   AWS_SECRET_ACCESS_KEY: string
//   AWS_SESSION_TOKEN: string
//   AWS_REGION: string
//   AMPLIFY_DATA_DEFAULT_NAME: string
// }

// const dataEnv = env as unknown as DataClientEnvShape

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env)

Amplify.configure(resourceConfig, libraryOptions)

const client = generateClient<Schema>({
  authMode: 'iam', // ✅ REQUIRED for Lambda
})

type Args = {
  profileId: string
}

export const handler = async (event: AppSyncResolverEvent<Args>) => {
  if (!event.identity || !('sub' in event.identity)) {
    throw new Error('Unauthorized')
  }

  const { profileId } = event.arguments

  // // ✅ Fetch by known, correct ID
  // const { data: profile } = await client.models.Profile.get({
  //   id: profileId,
  // })

  console.log('becomeCreator args:', event.arguments)
  const getResult = await client.models.Profile.get({ id: profileId })

  if (!getResult.data) {
    console.error('Profile.get failed', JSON.stringify(getResult, null, 2))
    throw new Error('Profile not found')
  }

  console.log('Profile.get raw result:', JSON.stringify(getResult, null, 2))

  const profile = getResult.data

  if (!profile) {
    throw new Error('Profile not found')
  }

  const listResult = await client.models.Profile.list({ limit: 5 })

  console.log(
    'Profile.list sample:',
    JSON.stringify(
      listResult.data?.map((p) => p.id),
      null,
      2
    )
  )

  // 🔒 Optional safety check
  // Ensure the caller owns this profile (by email)
  const email =
    'email' in event.identity.claims ? event.identity.claims.email : undefined

  if (email && profile.email !== email) {
    throw new Error('Forbidden')
  }

  if (profile.role === 'creator') {
    return { success: true }
  }

  await client.models.Profile.update({
    id: profile.id,
    role: 'creator',
  })

  return { success: true }
}
