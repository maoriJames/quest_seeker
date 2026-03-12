import { generateClient } from 'aws-amplify/api'
import { getCurrentUser } from 'aws-amplify/auth'
import { getProfile } from '@/graphql/queries'
import { updateProfile } from '@/graphql/mutations'
import { MyQuest } from '@/types'

const client = generateClient()

// 🔜 DEPRECATE: only used for task progress updates now, not joining
// Once my_quests is fully replaced by UserQuest, this can be removed entirely
export async function updateQuestProgressInProfile(
  questId: string,
  MyQuests: MyQuest[],
) {
  try {
    const user = await getCurrentUser()
    const userId = user.userId

    const { data } = await client.graphql({
      query: getProfile,
      variables: { id: userId },
      authMode: 'userPool',
    })

    const profile = data?.getProfile
    if (!profile) throw new Error('Profile not found')

    const existingQuests: MyQuest[] = profile.my_quests
      ? JSON.parse(profile.my_quests)
      : []

    const existingQuest = existingQuests.find((q) => q.quest_id === questId)
    if (!existingQuest) return // joining is handled by Lambda now

    // 🔄 Update existing quest task progress only
    MyQuests.forEach((newMyQuest) => {
      newMyQuest.tasks.forEach((newTask) => {
        const index = existingQuest.tasks.findIndex((t) => t.id === newTask.id)
        if (index >= 0) {
          existingQuest.tasks[index] = {
            ...existingQuest.tasks[index],
            ...newTask,
          }
        } else {
          existingQuest.tasks.push(newTask)
        }
      })
      existingQuest.completed = existingQuest.tasks.every((t) => t.completed)
    })

    await client.graphql({
      query: updateProfile,
      variables: {
        input: {
          id: profile.id,
          my_quests: JSON.stringify(existingQuests),
        },
      },
      authMode: 'userPool',
    })
  } catch (err) {
    console.error('❌ Failed to update quest progress in profile:', err)
  }
}
