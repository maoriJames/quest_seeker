// src/debug/checkProfile.ts
import { generateClient } from 'aws-amplify/api'
import { getCurrentUser } from 'aws-amplify/auth'
import { getProfile } from '@/graphql/queries'

export async function checkProfile() {
  const client = generateClient()
  const user = await getCurrentUser()

  const res = await client.graphql({
    query: getProfile,
    variables: { id: user.userId },
    authMode: 'userPool',
  })

  console.log('USER SUB:', user.userId)
  console.log('PROFILE RESULT:', res)

  return res
}
