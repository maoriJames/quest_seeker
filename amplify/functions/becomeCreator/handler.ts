import type { AppSyncResolverEvent } from 'aws-lambda'
import type { Schema } from '../../data/resource'
import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { env } from '$amplify/env/becomeCreator'
import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
  UserNotFoundException,
  CognitoIdentityProviderServiceException,
} from '@aws-sdk/client-cognito-identity-provider'

const cognitoClient = new CognitoIdentityProviderClient({})

let dataClient: ReturnType<typeof generateClient<Schema>>

async function initializeAmplify() {
  if (dataClient) return // Already initialized
  const { resourceConfig, libraryOptions } =
    await getAmplifyDataClientConfig(env)
  Amplify.configure(resourceConfig, libraryOptions)
  dataClient = generateClient<Schema>({ authMode: 'iam' })
}

type Args = {
  profileId: string
}

interface ExtendedEnv {
  AMPLIFY_AUTH_USERPOOL_ID?: string
  // Add other variables if necessary
}

export const handler = async (event: AppSyncResolverEvent<Args>) => {
  await initializeAmplify()

  const typedEnv = env as typeof env & ExtendedEnv
  const userPoolId = typedEnv.AMPLIFY_AUTH_USERPOOL_ID

  if (!userPoolId) {
    throw new Error(
      'Missing User Pool ID. Ensure you granted access in auth/resource.ts'
    )
  }

  // 3. Identity Validation
  if (!event.identity || !('sub' in event.identity)) {
    throw new Error('Unauthorized')
  }

  const { sub, claims } = event.identity
  const { profileId } = event.arguments

  // 4. Fetch Profile
  const { data: profile, errors } = await dataClient.models.Profile.get({
    id: profileId,
  })

  if (errors || !profile) {
    console.error('Profile not found:', errors)
    throw new Error('Profile not found')
  }

  // 5. Ownership Safety Check
  const callerEmail = 'email' in claims ? (claims.email as string) : undefined
  if (callerEmail && profile.email !== callerEmail) {
    throw new Error('Forbidden: You do not own this profile')
  }

  // 6. Role Update (only if necessary)
  if (profile.role !== 'creator') {
    const { errors: updateErrors } = await dataClient.models.Profile.update({
      id: profile.id,
      role: 'creator',
    })

    if (updateErrors) {
      console.error('Failed to update profile role:', updateErrors)
      throw new Error('Database update failed')
    }
  }

  // 7. Cognito Group Assignment with Type-Safe Errors
  try {
    await cognitoClient.send(
      new AdminAddUserToGroupCommand({
        UserPoolId: userPoolId,
        Username: sub,
        GroupName: 'creator',
      })
    )
  } catch (err) {
    if (err instanceof UserNotFoundException) {
      console.error('User does not exist in Cognito.')
      throw err
    }

    if (err instanceof CognitoIdentityProviderServiceException) {
      // If the user is already in the group, we can consider this a success
      if (err.name === 'ResourceNotFoundException') {
        // Group doesn't exist
        throw new Error(`Cognito Group 'creator' does not exist.`)
      }
      console.warn(`Cognito note [${err.name}]: ${err.message}`)
    } else {
      throw err // Re-throw unknown errors
    }
  }

  return { success: true }
}
