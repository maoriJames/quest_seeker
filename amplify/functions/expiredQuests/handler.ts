import { type Schema } from '../../data/resource'
import type { Handler } from 'aws-lambda'
import { generateClient } from 'aws-amplify/data'

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
