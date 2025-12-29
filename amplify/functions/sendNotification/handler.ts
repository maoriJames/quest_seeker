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
    if (newImage.status?.S !== 'published') continue

    const newParticipants = newImage.participants?.L ?? []
    const oldParticipants = oldImage.participants?.L ?? []

    const newIds = newParticipants
      .map((p) => p.S)
      .filter((id): id is string => !!id)

    const oldIds = oldParticipants
      .map((p) => p.S)
      .filter((id): id is string => !!id)

    // Who just joined
    const joinedIds = newIds.filter((id) => !oldIds.includes(id))

    if (joinedIds.length === 0) {
      console.log('No new participants joined')
      continue
    }

    console.log('New participants joined:', joinedIds)

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

    for (const seekerId of joinedIds) {
      const seekerProfile = await ddb.send(
        new GetItemCommand({
          TableName: process.env.PROFILE_TABLE_NAME,
          Key: { id: { S: seekerId } },
        })
      )

      const seekerEmail = seekerProfile.Item?.email?.S
      if (!seekerEmail) {
        console.warn('Seeker email not found for', seekerId)
        continue
      }

      try {
        await ses.send(
          new SendEmailCommand({
            Source: 'webdev@maorilandinfo.co.nz',
            Destination: { ToAddresses: [seekerEmail] },
            Message: {
              Subject: { Data: `You joined ${questName}!` },
              Body: {
                Text: {
                  Data: `Kia ora! You’ve successfully joined the quest "${questName}".`,
                },
              },
            },
          })
        )

        console.log('Seeker notification sent to:', seekerEmail)
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'MessageRejected') {
          console.warn('SES rejected seeker email (sandbox):', seekerEmail)
        } else {
          console.error('Unexpected seeker email error:', err)
        }
      }

      console.log('Seeker notification sent to:', seekerEmail)
    }
  }
}
