import { Amplify } from 'aws-amplify'
import outputs from './amplify_outputs.json'
import { generateClient } from 'aws-amplify/data'

type Quest = {
  id: string
  quest_end: string
  status: string
}

interface QuestModel {
  list(args: {
    filter?: {
      quest_end?: { lt?: string }
      status?: { ne?: string }
    }
  }): Promise<{ data: Quest[] }>

  update(args: { id: string; status?: string }): Promise<Quest>
}

Amplify.configure(outputs)

// Generate client normally (untyped for backend)
const client = generateClient({
  authMode: 'iam',
})

// Type ONLY the Quest model (safe, no TS complaints)
const models = client.models as unknown as {
  Quest: QuestModel
}

const QuestModel = models.Quest

export const handler = async () => {
  console.log('Checking for expired Quests.')

  const now = new Date().toISOString()

  const { data: expiredItems } = await QuestModel.list({
    filter: {
      quest_end: { lt: now },
      status: { ne: 'expired' },
    },
  })

  if (!expiredItems.length) {
    console.log('No expired quests found.')
    return
  }

  await Promise.all(
    expiredItems.map((item) =>
      QuestModel.update({
        id: item.id,
        status: 'expired',
      })
    )
  )

  console.log(`Updated ${expiredItems.length} quests.`)
}
