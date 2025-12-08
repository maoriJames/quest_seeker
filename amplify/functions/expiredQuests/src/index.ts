import { generateClient } from 'aws-amplify/data'

import { Schema } from '../../../data/resource'

const client = generateClient<Schema>({})

export const handler = async () => {
  console.log('Checking for expired Quests.')

  // Use quest_end field from your schema
  const now = new Date().toISOString()

  const { data: expiredItems } = await client.models.Quest.list({
    filter: {
      quest_end: {
        // *** Use quest_end here ***
        lt: now,
      },
      status: {
        ne: 'expired',
      },
    },
  })

  if (expiredItems.length === 0) {
    console.log('No expired items found.')
    return
  }

  const updatePromises = expiredItems.map((item) =>
    client.models.Quest.update({
      id: item.id,
      status: 'expired',
    })
  )

  await Promise.all(updatePromises)
  console.log(`Updated ${expiredItems.length} Quests to 'expired' status.`)
}
