import { generateClient } from 'aws-amplify/api'
import { getCurrentUser } from 'aws-amplify/auth'
import { getProfile } from '@/graphql/queries'
import { updateProfile } from '@/graphql/mutations'
import { MyQuest } from '@/types'
// import { QuestStatus } from '@/graphql/API'

const client = generateClient()

export async function addQuestToProfile(questId: string, MyQuests: MyQuest[]) {
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

    // ✅ Current points (default to 0)
    let updatedPoints = profile.points ?? 0

    // 🟢 FIRST TIME joining this quest
    if (!existingQuest) {
      console.log('🆕 Adding new quest + 10 points')

      existingQuests.push({
        quest_id: questId,
        tasks: MyQuests.flatMap((qt) => qt.tasks),
        title: MyQuests[0].title,
        completed: false,
      })

      // 🎉 Award points
      updatedPoints += 10
    } else {
      // 🔄 Update existing quest
      MyQuests.forEach((newMyQuest) => {
        newMyQuest.tasks.forEach((newTask) => {
          const index = existingQuest.tasks.findIndex(
            (t) => t.id === newTask.id
          )

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
    }

    // 💾 Save quests + points together
    await client.graphql({
      query: updateProfile,
      variables: {
        input: {
          id: profile.id,
          my_quests: JSON.stringify(existingQuests),
          points: updatedPoints,
        },
      },
      authMode: 'userPool',
    })

    console.log('✅ Profile updated with points:', updatedPoints)
  } catch (err) {
    console.error('❌ Failed to add/update quest in profile:', err)
  }
}
