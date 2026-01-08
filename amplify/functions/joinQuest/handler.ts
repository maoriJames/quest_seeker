import type { AppSyncResolverHandler } from 'aws-lambda'
import type { Schema } from '../../data/resource'
import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'

import { env } from '$amplify/env/joinQuest'

// 🔐 Configure Amplify for service (IAM) auth
const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env)

Amplify.configure(resourceConfig, libraryOptions)

const client = generateClient<Schema>({
  authMode: 'iam',
})

type Args = {
  questId: string
  profileId: string
}

type QuestTask = {
  id: string
  description: string
  completed: boolean
  isImage: boolean
  isLocation: boolean
  requiresCaption: boolean
  answer: string
  caption: string
  location: string
}

type MyQuest = {
  quest_id: string
  quest_status: string
  completed: boolean
  title: string
  tasks: QuestTask[]
}

export const handler: AppSyncResolverHandler<Args, boolean> = async (event) => {
  const { questId, profileId } = event.arguments

  if (!questId || !profileId) {
    throw new Error('Missing questId or profileId')
  }

  const { data: quest } = await client.models.Quest.get({ id: questId })
  if (!quest) throw new Error('Quest not found')

  const { data: profile } = await client.models.Profile.get({ id: profileId })
  if (!profile) throw new Error('Profile not found')

  /* 3️⃣ Build quest entry */
  const newQuest = {
    quest_id: quest.id,
    quest_status: quest.status,
    completed: false,
    title: quest.quest_name,
    tasks: quest.quest_tasks ?? [],
  }

  const existingQuests: MyQuest[] = Array.isArray(profile.my_quests)
    ? (profile.my_quests as MyQuest[])
    : []

  const alreadyJoined = existingQuests.some((q) => q.quest_id === questId)

  const updatedMyQuests = alreadyJoined
    ? existingQuests
    : [...existingQuests, newQuest]

  /* 5️⃣ Save profile */
  await client.models.Profile.update({
    id: profileId,
    my_quests: updatedMyQuests,
  })

  return true
}
