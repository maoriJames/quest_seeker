import type { AppSyncResolverHandler } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import { randomUUID } from 'crypto'
import { sendJoinEmails } from './sendEmails'

const ddbClient = new DynamoDBClient({})
const ddb = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: false,
  },
})

const QUEST_TABLE = process.env.QUEST_TABLE_NAME!
const USER_QUEST_TABLE = process.env.USER_QUEST_TABLE_NAME!
const PROFILE_TABLE = process.env.PROFILE_TABLE_NAME!

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

type DynamoDBError = {
  name: string
  message: string
}

export const handler: AppSyncResolverHandler<Args, boolean> = async (event) => {
  const { questId, profileId } = event.arguments
  console.log('joinQuest invoked', { questId, profileId })
  if (!questId || !profileId) throw new Error('Missing questId or profileId')

  // 1️⃣ Fetch quest and profile in parallel
  const [{ Item: quest }, { Item: profile }] = await Promise.all([
    ddb.send(new GetCommand({ TableName: QUEST_TABLE, Key: { id: questId } })),
    ddb.send(
      new GetCommand({ TableName: PROFILE_TABLE, Key: { id: profileId } }),
    ),
  ])

  if (!quest) throw new Error('Quest not found')
  if (!profile) throw new Error('Profile not found')
  console.log('Quest and profile fetched successfully')
  // 2️⃣ Parse quest tasks
  const rawTasks = (() => {
    try {
      if (!quest.quest_tasks) return []
      let parsed =
        typeof quest.quest_tasks === 'string'
          ? JSON.parse(quest.quest_tasks)
          : quest.quest_tasks
      if (typeof parsed === 'string') parsed = JSON.parse(parsed)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })()

  // 3️⃣ Map tasks for user
  const tasksForSave = JSON.stringify(
    rawTasks.map((task: QuestTask) => ({
      ...task,
      completed: false,
      answer: '',
      caption: '',
      location: '',
    })),
  )

  // 4️⃣ Write UserQuest item directly to DynamoDB
  const now = new Date().toISOString()
  try {
    await ddb.send(
      new PutCommand({
        TableName: USER_QUEST_TABLE,
        Item: {
          id: randomUUID(),
          __typename: 'UserQuest',
          profileId,
          questId,
          status: 'ACTIVE',
          joinedAt: now,
          points: 0,
          tasks: tasksForSave,
          createdAt: now,
          updatedAt: now,
          owner: `${profileId}::${profileId}`,
        },
        ConditionExpression: 'attribute_not_exists(id)',
      }),
    )
    console.log(
      `✅ UserQuest created for profile ${profileId} quest ${questId}`,
    )
  } catch (err) {
    const dynamoErr = err as DynamoDBError
    const isDuplicate = dynamoErr.name === 'ConditionalCheckFailedException'
    if (isDuplicate) throw new Error('User has already joined this quest')
    throw new Error(`Failed to join quest: ${dynamoErr.message}`)
  }
  // 5️⃣ Award join points to profile
  const JOIN_POINTS = 10
  try {
    await ddb.send(
      new UpdateCommand({
        TableName: PROFILE_TABLE,
        Key: { id: profileId },
        UpdateExpression:
          'SET points = if_not_exists(points, :zero) + :pts, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':pts': JOIN_POINTS,
          ':zero': 0,
          ':updatedAt': now,
        },
      }),
    )
    console.log(`✅ Awarded ${JOIN_POINTS} points to profile ${profileId}`)
  } catch (err) {
    // Non-fatal — quest join already succeeded
    console.error('Failed to award join points:', err)
  }

  // 6️⃣ Send notifications (non-fatal)
  // 6️⃣ Send notifications (non-fatal)
  console.log('Attempting to send join emails...')
  try {
    await sendJoinEmails(questId, profileId, PROFILE_TABLE, QUEST_TABLE)
    console.log('✅ Join emails sent')
  } catch (err) {
    console.error('Failed to send join emails:', err)
  }

  console.log('Handler complete, returning true')
  return true
}
