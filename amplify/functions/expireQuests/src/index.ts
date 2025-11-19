import { DateTime } from 'luxon'
import axios from 'axios'

const API_URL = process.env.APPSYNC_API_URL!
const API_KEY = process.env.APPSYNC_API_KEY!

const LIST_QUESTS = `
  query ListQuests {
    listQuests {
      items {
        id
        quest_end
        status
      }
    }
  }
`

const UPDATE_QUEST = `
  mutation UpdateQuest($id: ID!, $status: String!) {
    updateQuest(id: $id, status: $status) {
      id
      status
    }
  }
`

type GraphQLVariables = { [key: string]: string | number | boolean | null }

async function graphql(query: string, variables: GraphQLVariables = {}) {
  const res = await axios.post(
    API_URL,
    { query, variables },
    { headers: { 'x-api-key': API_KEY } }
  )
  return res.data
}

export const handler = async () => {
  const nowNZ = DateTime.now().setZone('Pacific/Auckland')

  const questsRes = await graphql(LIST_QUESTS)
  const quests = questsRes.data.listQuests.items

  for (const quest of quests) {
    if (!quest.quest_end || quest.status === 'expired') continue

    if (DateTime.fromISO(quest.quest_end) < nowNZ) {
      console.log(`Expiring quest ${quest.id}`)
      await graphql(UPDATE_QUEST, { id: quest.id, status: 'expired' })
    }
  }

  return { success: true }
}
