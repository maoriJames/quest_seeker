import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import { randomUUID } from 'crypto'

// console.log('EVENT ARGUMENTS:', JSON.stringify(event.arguments, null, 2))

const client = new DynamoDBClient({})
const ddb = DynamoDBDocumentClient.from(client)

const QUEST_TABLE = process.env.QUEST_TABLE_NAME!

// -----------------------------
// Types
// -----------------------------
type QuestAction = 'CREATE_DRAFT' | 'UPDATE_DRAFT' | 'PUBLISH'

interface QuestTask {
  id: string
  description: string
  isImage: boolean
  requiresCaption: boolean
  isLocation: boolean
  caption?: string
  answer?: string
  location?: string
  completed?: boolean
}

interface AppSyncEvent {
  arguments: {
    action: QuestAction
    questId?: string

    name?: string
    details?: string

    imagePath?: string
    imageThumbPath?: string

    startAt?: string
    endAt?: string

    region?: string
    entryFee?: number | null

    prizes?: unknown
    sponsors?: unknown
    tasks?: unknown
  }
  identity: {
    sub: string
    claims?: {
      'cognito:groups'?: string[]
    }
  }
}

// -----------------------------
// Handler
// -----------------------------
export const handler = async (event: AppSyncEvent) => {
  const input = event.arguments

  const userId = event.identity.sub
  const groups = event.identity.claims?.['cognito:groups'] ?? []

  const isCreator = groups.includes('creator')
  const isAdmin = groups.includes('admin')

  if (!isCreator && !isAdmin) {
    throw new Error('Not authorized')
  }

  const now = new Date().toISOString()

  // -----------------------------
  // JSON Helper
  // -----------------------------

  const parseAwsJson = <T>(value: unknown, fallback: T): T => {
    if (value === undefined || value === null) return fallback
    if (typeof value === 'string') return JSON.parse(value)
    return value as T
  }

  const normalizeAwsJson = (value: unknown, fallback = '[]') => {
    if (value === undefined || value === null) return fallback
    return typeof value === 'string' ? value : JSON.stringify(value)
  }

  // -----------------------------
  // CREATE DRAFT
  // -----------------------------
  if (input.action === 'CREATE_DRAFT') {
    const questId = randomUUID()

    await ddb.send(
      new PutCommand({
        TableName: QUEST_TABLE,
        Item: {
          id: questId,
          creator_id: userId,
          status: 'draft',

          quest_name: input.name ?? null,
          quest_details: input.details ?? null,

          quest_image: input.imagePath ?? null,
          quest_image_thumb: input.imageThumbPath ?? null,

          quest_start_at: input.startAt ?? null,
          quest_end_at: input.endAt ?? null,

          region: input.region ?? null,
          quest_entry: input.entryFee ?? null,

          quest_prize_info: normalizeAwsJson(input.prizes),
          quest_sponsor: normalizeAwsJson(input.sponsors),
          quest_tasks: normalizeAwsJson(input.tasks),

          created_at: now,
          updated_at: now,
        },
      }),
    )

    return {
      questId,
      status: 'draft',
    }
  }

  // -----------------------------
  // UPDATE / PUBLISH (needs quest)
  // -----------------------------
  if (!input.questId) {
    throw new Error('questId is required')
  }

  const existing = await ddb.send(
    new GetCommand({
      TableName: QUEST_TABLE,
      Key: { id: input.questId },
    }),
  )

  if (!existing.Item) {
    throw new Error('Quest not found')
  }

  const quest = existing.Item

  // Ownership enforcement
  if (quest.creator_id !== userId && !isAdmin) {
    throw new Error('Not allowed to modify this quest')
  }

  // Published quests are immutable (except admin)
  if (quest.status === 'published' && !isAdmin) {
    throw new Error('Published quests cannot be edited')
  }

  // -----------------------------
  // PUBLISH validation
  // -----------------------------
  if (input.action === 'PUBLISH') {
    if (!input.name) throw new Error('Quest name required')
    if (!input.details) throw new Error('Quest details required')
    if (!input.startAt || !input.endAt) throw new Error('Quest dates required')

    if (new Date(input.endAt) <= new Date(input.startAt)) {
      throw new Error('End date must be after start date')
    }

    const tasks = parseAwsJson<QuestTask[]>(input.tasks, [])

    if (!Array.isArray(tasks) || tasks.length === 0) {
      throw new Error('At least one task is required')
    }
  }

  // -----------------------------
  // Build update expression
  // -----------------------------
  const updates: Record<string, unknown> = {
    quest_name: input.name ?? quest.quest_name,
    quest_details: input.details ?? quest.quest_details,
    quest_image: input.imagePath ?? quest.quest_image,
    quest_image_thumb: input.imageThumbPath ?? quest.quest_image_thumb,
    quest_start_at: input.startAt ?? quest.quest_start_at,
    quest_end_at: input.endAt ?? quest.quest_end_at,
    region: input.region ?? quest.region,
    quest_entry:
      input.entryFee !== undefined ? input.entryFee : quest.quest_entry,
    quest_prize_info:
      input.prizes !== undefined
        ? normalizeAwsJson(input.prizes)
        : quest.quest_prize_info,

    quest_sponsor:
      input.sponsors !== undefined
        ? normalizeAwsJson(input.sponsors)
        : quest.quest_sponsor,

    quest_tasks:
      input.tasks !== undefined
        ? normalizeAwsJson(input.tasks)
        : quest.quest_tasks,

    updated_at: now,
  }

  if (input.action === 'PUBLISH') {
    updates.status = 'published'
    updates.published_at = now
  }

  // -----------------------------
  // DynamoDB update
  // -----------------------------
  const expressionParts: string[] = []
  const ExpressionAttributeNames: Record<string, string> = {}
  const ExpressionAttributeValues: Record<string, unknown> = {}

  Object.entries(updates).forEach(([key, value], index) => {
    const nameKey = `#k${index}`
    const valueKey = `:v${index}`
    ExpressionAttributeNames[nameKey] = key
    ExpressionAttributeValues[valueKey] = value
    expressionParts.push(`${nameKey} = ${valueKey}`)
  })

  await ddb.send(
    new UpdateCommand({
      TableName: QUEST_TABLE,
      Key: { id: input.questId },
      UpdateExpression: `SET ${expressionParts.join(', ')}`,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    }),
  )

  return {
    questId: input.questId,
    status: input.action === 'PUBLISH' ? 'published' : 'draft',
  }
}
