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
    console.log('🔍 Looking for UserQuest:', { profileId, questId })

    const { data: userQuests, errors } = await client.models.UserQuest.list({
      filter: {
        profileId: { eq: profileId },
        questId: { eq: questId },
      },
    })

    console.log('🔍 UserQuests found:', userQuests?.length, errors)

    if (errors?.length) throw new Error(errors[0].message)

    const userQuest = userQuests?.[0]
    console.log('🔍 UserQuest to update:', userQuest?.id)

    if (!userQuest) {
      console.warn('⚠️ No UserQuest found — not joined?')
      return
    }

    const result = await client.models.UserQuest.update({
      id: userQuest.id,
      tasks: JSON.stringify(updatedTasks),
      status: isCompleted ? 'COMPLETED' : 'ACTIVE',
    })

    console.log('✅ UserQuest update result:', result)
  } catch (err) {
    console.error('❌ Failed to update quest progress:', err)
  }
}
