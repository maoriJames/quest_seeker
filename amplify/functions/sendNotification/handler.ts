import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'
import { DynamoDBStreamHandler } from 'aws-lambda'

const ses = new SESClient()
const ddb = new DynamoDBClient()

export const handler: DynamoDBStreamHandler = async (event) => {
  console.log('Lambda invoked with event:', JSON.stringify(event))

  for (const record of event.Records) {
    if (record.eventName === 'MODIFY') {
      const newImage = record.dynamodb?.NewImage
      const oldImage = record.dynamodb?.OldImage

      // Detect if participants list changed
      if (newImage?.participants?.S !== oldImage?.participants?.S) {
        const creatorId = newImage?.creator_id?.S
        const questName = newImage?.quest_name?.S

        if (creatorId) {
          // 1. Look up creator's profile
          const profileResult = await ddb.send(
            new GetItemCommand({
              TableName: process.env.PROFILE_TABLE_NAME,
              Key: { id: { S: creatorId } },
            })
          )

          const creatorEmail = profileResult.Item?.email?.S

          // 2. Send email if email found
          if (creatorEmail) {
            await ses.send(
              new SendEmailCommand({
                Source: 'webdev@maorilandinfo.co.nz',
                Destination: { ToAddresses: [creatorEmail] },
                Message: {
                  Subject: { Data: `New Member in ${questName}!` },
                  Body: {
                    Text: {
                      Data: `A user has joined your quest: ${questName}.`,
                    },
                  },
                },
              })
            )
          }
        }
      }
    }
  }
}
