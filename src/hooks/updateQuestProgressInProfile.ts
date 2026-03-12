import { generateClient } from 'aws-amplify/data'
import { getCurrentUser } from 'aws-amplify/auth'
import { Schema } from 'amplify/data/resource'
import { Task } from '@/types'

const client = generateClient<Schema>()

export async function updateQuestProgressInProfile(
  questId: string,
  updatedTasks: Task[],
  isCompleted: boolean,
) {
  try {
    const user = await getCurrentUser()
    const profileId = user.userId

    // 1️⃣ Find the existing UserQuest item
    const { data: userQuests, errors } = await client.models.UserQuest.list({
      filter: {
        profileId: { eq: profileId },
        questId: { eq: questId },
      },
    })

    if (errors?.length) throw new Error(errors[0].message)

    const userQuest = userQuests?.[0]
    if (!userQuest) return // not joined, nothing to update

    // 2️⃣ Update the UserQuest item with new task progress
    await client.models.UserQuest.update({
      id: userQuest.id,
      tasks: JSON.stringify(updatedTasks),
      status: isCompleted ? 'COMPLETED' : 'ACTIVE',
    })

    // 🔜 DUAL-WRITE: keep my_quests in sync while other components still depend on it
    // Remove this block once all components migrate to UserQuest
    // ... dual-write removed since TaskInformationWindow is now migrated
  } catch (err) {
    console.error('❌ Failed to update quest progress:', err)
  }
}
