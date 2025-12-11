// amplify/functions/expiredQuests/handler.ts
import { type Handler } from 'aws-lambda'
// Add this line at the very top of your file:
// @ts-ignore
import { env } from '$amplify/env/expiredQuests';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { type Schema } from '../../data/resource'

// Use 'any' specifically within an intersection to add the missing properties
// to the type definition *for this file only*.
const runtimeEnv = { ...env } as typeof env & {
  AMPLIFY_DATA_DEFAULT_NAME: string
  AWS_ACCESS_KEY_ID: string
  AWS_SECRET_ACCESS_KEY: string
  AWS_SESSION_TOKEN: string
  // We already know AWS_REGION exists
}

// Pass the flexible runtimeEnv object to the configuration function.
const { resourceConfig, libraryOptions } =
  await getAmplifyDataClientConfig(runtimeEnv)

Amplify.configure(resourceConfig, libraryOptions)

// Create a typed client
const client = generateClient<Schema>()

export const handler: Handler = async () => {
  // Example: find quests where quest_end < now and status !== 'expired'
  const now = new Date().toISOString()

  const { data: quests } = await client.models.Quest.list({
    filter: {
      quest_end: { lt: now },
      status: { ne: 'expired' },
    },
  })

  console.log(`Found ${quests.length} quests to expire.`)

  for (const quest of quests) {
    await client.models.Quest.update({
      id: quest.id,
      status: 'expired',
    })
  }

  return {
    updated: quests.length,
  }
}
