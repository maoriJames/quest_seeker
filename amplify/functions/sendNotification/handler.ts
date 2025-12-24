import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'
import { DynamoDBStreamHandler } from 'aws-lambda'

const ses = new SESClient()
const ddb = new DynamoDBClient()

export const handler: DynamoDBStreamHandler = async (event) => {
  console.log('Lambda invoked with event:', JSON.stringify(event))

  for (const record of event.Records) {
    if (record.eventName !== 'MODIFY') continue

    const newImage = record.dynamodb?.NewImage
    const oldImage = record.dynamodb?.OldImage
    if (!newImage || !oldImage) continue

    const newParticipants = newImage.participants?.L ?? []
    const oldParticipants = oldImage.participants?.L ?? []

    // 🔔 someone joined
    if (newParticipants.length <= oldParticipants.length) continue

    const creatorId = newImage.creator_id?.S
    const questName = newImage.quest_name?.S ?? 'your quest'

    if (!creatorId) continue

    // 1. Look up creator's profile
    const profileResult = await ddb.send(
      new GetItemCommand({
        TableName: process.env.PROFILE_TABLE_NAME,
        Key: { id: { S: creatorId } },
      })
    )

    const creatorEmail = profileResult.Item?.email?.S
    if (!creatorEmail) {
      console.warn('Creator email not found for', creatorId)
      continue
    }

    // 2. Send email
    try {
      await ses.send(
        new SendEmailCommand({
          Source: 'webdev@maorilandinfo.co.nz',
          Destination: { ToAddresses: [creatorEmail] },
          Message: {
            Subject: { Data: `New Member in ${questName}!` },
            Body: {
              Text: {
                Data: `A new participant has joined your quest: ${questName}.`,
              },
            },
          },
        })
      )

      console.log('Notification email sent to:', creatorEmail)
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'MessageRejected') {
        console.warn('SES rejected email (sandbox):', creatorEmail)
        // IMPORTANT: do NOT rethrow
      } else {
        console.error('Unexpected email error:', err)
        // optional: rethrow only for real infra issues
      }
    }

    console.log('Notification email sent to:', creatorEmail)
  }
}
