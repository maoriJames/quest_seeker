import { generateClient } from 'aws-amplify/api'
import { getCurrentUser } from 'aws-amplify/auth'
import { getProfile } from '@/graphql/queries'
import { updateProfile } from '@/graphql/mutations'

const client = generateClient()
interface QuestTask {
  id: string
  title: string
  description?: string
  completed: boolean
}

interface MyQuest {
  quest_id: string
  tasks: QuestTask[]
}

export async function addQuestToProfile(
  questId: string,
  questTasks: QuestTask[]
) {
  try {
    const user = await getCurrentUser()
    const userId = user.userId // or user.sub depending on your setup

    const { data } = await client.graphql({
      query: getProfile,
      variables: { id: userId },
    })
    const profile = data?.getProfile
    if (!profile) throw new Error('Profile not found')

    // Parse existing my_quests JSON, or start with empty array
    const existingQuests: MyQuest[] = profile.my_quests
      ? JSON.parse(profile.my_quests)
      : []

    // Prevent duplicates
    if (existingQuests.some((q) => q.quest_id === questId)) {
      console.log('⚠️ Quest already in profile, skipping update.')
      return
    }

    const updatedQuests: MyQuest[] = [
      ...existingQuests,
      { quest_id: questId, tasks: questTasks },
    ]

    // Save back to profile as JSON
    await client.graphql({
      query: updateProfile,
      variables: {
        input: {
          id: profile.id,
          my_quests: JSON.stringify(updatedQuests),
        },
      },
    })

    console.log('✅ Quest with typed tasks added to profile.')
  } catch (err) {
    console.error('❌ Failed to add quest to profile:', err)
  }
}
