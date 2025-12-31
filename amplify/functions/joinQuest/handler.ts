import { AppSyncResolverHandler } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))

const QUEST_TABLE = process.env.DATA_QUEST_TABLE_NAME!

type Args = {
  questId: string
  profileId: string
}

export const handler: AppSyncResolverHandler<Args, boolean> = async (event) => {
  const { questId, profileId } = event.arguments

  if (!questId || !profileId) {
    throw new Error('Missing questId or profileId')
  }

  // 1️⃣ Fetch quest
  const { Item } = await ddb.send(
    new GetCommand({
      TableName: QUEST_TABLE,
      Key: { id: questId },
    })
  )

  if (!Item) {
    throw new Error('Quest not found')
  }

  const participants: string[] =
    typeof Item.participants === 'string'
      ? JSON.parse(Item.participants)
      : (Item.participants ?? [])

  // 2️⃣ Idempotent add
  if (!participants.includes(profileId)) {
    participants.push(profileId)
  }

  // 3️⃣ Update quest
  await ddb.send(
    new UpdateCommand({
      TableName: QUEST_TABLE,
      Key: { id: questId },
      UpdateExpression: 'SET participants = :p',
      ExpressionAttributeValues: {
        ':p': participants,
      },
    })
  )

  return true
}
