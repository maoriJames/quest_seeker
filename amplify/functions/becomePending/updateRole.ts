import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))

export const updateUserRole = async (
  userId: string,
  newRole: string,
  tableName: string,
) => {
  await ddb.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { id: userId },
      UpdateExpression: 'SET #role = :role',
      ExpressionAttributeNames: { '#role': 'role' },
      ExpressionAttributeValues: { ':role': newRole },
    }),
  )
}
