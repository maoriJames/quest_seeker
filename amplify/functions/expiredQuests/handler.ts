// amplify/functions/expiredQuests/handler.ts
import type { Handler } from 'aws-lambda'
import type { Schema } from '../../data/resource'

import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'

// IMPORTANT: use the *function name* from defineFunction({ name: 'expired-quests' })
import { env } from '$amplify/env/expired-quests'

// Configure Amplify using Lambda credentials + schema info
const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env)
Amplify.configure(resourceConfig, libraryOptions)

// Typed client
const client = generateClient<Schema>()

export const handler: Handler = async () => {
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

  return { updated: quests.length }
}
