import { generateClient } from 'aws-amplify/api'
import { getCurrentUser } from 'aws-amplify/auth'
import { getProfile } from '@/graphql/queries'
import { updateProfile } from '@/graphql/mutations'
import { MyQuest } from '@/types'
// import { QuestStatus } from '@/graphql/API'

const client = generateClient()

// interface MyQuest {
//   quest_id: string
//   tasks: Task[]
// }

export async function addQuestToProfile(questId: string, MyQuests: MyQuest[]) {
  try {
    const user = await getCurrentUser()
    const userId = user.userId // or user.sub depending on your setup

    const { data } = await client.graphql({
      query: getProfile,
      variables: { id: userId },
      authMode: 'userPool',
    })

    const profile = data?.getProfile
    if (!profile) throw new Error('Profile not found')

    // Parse my_quests from JSON if needed
    const existingQuests: MyQuest[] = profile.my_quests
      ? JSON.parse(profile.my_quests)
      : []

    const existingQuest = existingQuests.find((q) => q.quest_id === questId)

    // 🟢 If no quest exists yet, add it
    if (!existingQuest) {
      console.log('🆕 Adding new quest to profile')
      existingQuests.push({
        quest_id: questId,
        tasks: MyQuests.flatMap((qt) => qt.tasks),
        title: MyQuests[0].title,
        completed: false,
        // quest_status: QuestStatus.published,
      })
    } else {
      // 🔄 Merge/update existing tasks
      console.log('✏️ Updating existing quest tasks')

      MyQuests.forEach((newMyQuest) => {
        newMyQuest.tasks.forEach((newTask) => {
          const existingTaskIndex = existingQuest!.tasks.findIndex(
            (t) => t.id === newTask.id
          )

          if (existingTaskIndex >= 0) {
            console.log(`✏️ Updating existing task: ${newTask.id}`)
            existingQuest!.tasks[existingTaskIndex] = {
              ...existingQuest!.tasks[existingTaskIndex],
              ...newTask,
            }
          } else {
            console.log(`➕ Adding new task: ${newTask.id}`)
            existingQuest!.tasks.push(newTask)
          }
        })

        // 🔥 UPDATE QUEST COMPLETED STATUS HERE
        console.log('🔄 Checking if quest is now completed...')
        existingQuest!.completed = existingQuest!.tasks.every(
          (t) => t.completed
        )

        console.log('🏁 Quest completed:', existingQuest!.completed)
      })
    }

    // 🧩 Save updated quests array
    const updateResult = await client.graphql({
      query: updateProfile,
      variables: {
        input: {
          id: profile.id,
          my_quests: JSON.stringify(existingQuests),
        },
      },
      authMode: 'userPool',
    })

    console.log('✅ Profile updated successfully:', updateResult)
  } catch (err) {
    console.error('❌ Failed to add/update quest in profile:', err)
  }
}
