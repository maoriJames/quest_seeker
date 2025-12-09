import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'

// Configure Amplify using environment variables
Amplify.configure({
  API: {
    GraphQL: {
      endpoint: process.env.APPSYNC_API_URL!,
      region: process.env.AWS_REGION!,
      defaultAuthMode: 'iam',
    },
  },
})

// Your typed model interfaces
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

// Generate client
const client = generateClient({
  authMode: 'iam',
})

// Type the models
const models = client.models as unknown as {
  Quest: QuestModel
}

const QuestModel = models.Quest

// Lambda handler
export const handler = async () => {
  console.log('Checking for expired quests…')

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
