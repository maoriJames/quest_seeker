import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'

type Quest = {
  id: string
  quest_end: string
  status: string
}

Amplify.configure({
  API: {
    GraphQL: {
      endpoint: process.env.APPSYNC_API_URL!,
      region: process.env.AWS_REGION!,
      defaultAuthMode: 'iam',
    },
  },
})

const client = generateClient({ authMode: 'iam' })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const models = client.models as any

export const handler = async () => {
  console.log('Checking for expired quests…')

  const now = new Date().toISOString()

  const { data: expiredItems } = await models.Quest.list({
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
    expiredItems.map((q: Quest) =>
      models.Quest.update({
        id: q.id,
        status: 'expired',
      })
    )
  )

  console.log(`Updated ${expiredItems.length} quests.`)
}
