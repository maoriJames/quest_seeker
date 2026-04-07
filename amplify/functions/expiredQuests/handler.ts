import type { Handler } from 'aws-lambda'
import type { Schema } from '../../data/resource'
import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { env } from '$amplify/env/expiredQuests'
import { sendQuestExpiredEmail } from './sendEmails'

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env)
Amplify.configure(resourceConfig, libraryOptions)

const client = generateClient<Schema>()

export const handler: Handler = async () => {
  const now = new Date().toISOString()

  const { data: quests } = await client.models.Quest.list({
    filter: {
      quest_end_at: { lt: now },
      status: { ne: 'expired' },
    },
  })

  for (const quest of quests) {
    await client.models.Quest.update({
      id: quest.id,
      status: 'expired',
    })

    // ✅ Notify creator that quest has expired
    if (quest.creator_id) {
      try {
        await sendQuestExpiredEmail(
          quest.creator_id,
          quest.quest_name ?? 'your quest',
          quest.id,
        )
      } catch (err) {
        console.error(
          `Failed to send expired email for quest ${quest.id}:`,
          err,
        )
      }
    }
  }

  return { updated: quests.length }
}
