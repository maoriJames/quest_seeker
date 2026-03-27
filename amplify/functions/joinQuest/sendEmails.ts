import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'
import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider'

const ses = new SESClient({ region: 'ap-southeast-2' })
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const cognito = new CognitoIdentityProviderClient({ region: 'ap-southeast-2' })

const USER_POOL_ID = process.env.AMPLIFY_USER_POOL_ID!
const FROM_ADDRESS = 'noreply@questseeker.co.nz'

const getEmailFromCognito = async (
  userId: string,
): Promise<string | undefined> => {
  try {
    const result = await cognito.send(
      new AdminGetUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: userId,
      }),
    )
    const emailAttr = result.UserAttributes?.find(
      (attr) => attr.Name === 'email',
    )
    return emailAttr?.Value
  } catch (err) {
    console.error('Failed to fetch email from Cognito for user:', userId, err)
    return undefined
  }
}

const safeSend = async (command: SendEmailCommand) => {
  try {
    await ses.send(command)
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'MessageRejected') {
      console.warn('SES sandbox rejected email:', err.message)
    } else {
      console.error('SES unexpected error:', err)
    }
  }
}

export const sendJoinEmails = async (
  questId: string,
  profileId: string,
  profileTableName: string,
  questTableName: string,
) => {
  const [{ Item: quest }, { Item: joinerProfile }] = await Promise.all([
    ddb.send(
      new GetCommand({ TableName: questTableName, Key: { id: questId } }),
    ),
    ddb.send(
      new GetCommand({ TableName: profileTableName, Key: { id: profileId } }),
    ),
  ])

  if (!quest || !joinerProfile) {
    console.warn('sendJoinEmails: quest or joiner profile not found')
    return
  }

  const questName = quest.quest_name ?? 'a quest'
  const joinerName = joinerProfile.full_name ?? 'there'
  const creatorId = quest.creator_id
  const footer = `\n\n---\nThis is an automated transactional message. You are receiving this because you have an account on questseeker.co.nz.`
  // ✅ Fetch emails from Cognito
  const [joinerEmail, creatorEmail] = await Promise.all([
    getEmailFromCognito(profileId),
    creatorId ? getEmailFromCognito(creatorId) : Promise.resolve(undefined),
  ])

  // ... rest of sending logic unchanged
  // Email creator
  if (creatorId) {
    const { Item: creatorProfile } = await ddb.send(
      new GetCommand({ TableName: profileTableName, Key: { id: creatorId } }),
    )
    const creatorEmail = creatorProfile?.email
    const creatorName = creatorProfile?.full_name ?? 'there'

    if (creatorEmail) {
      await safeSend(
        new SendEmailCommand({
          Source: FROM_ADDRESS,
          Destination: { ToAddresses: [creatorEmail] },
          Message: {
            Subject: { Data: `New participant joined "${questName}"!` },
            Body: {
              Text: {
                Data: `Hi there ${creatorName},\n\n${joinerName} has just joined your quest "${questName}".\n\nYou can view your quest participants by logging into your account at questseeker.co.nz.\n\nNgā mihi,\nThe Quest Seeker Team${footer}`,
              },
            },
          },
        }),
      )
    }
  }

  if (joinerEmail) {
    await safeSend(
      new SendEmailCommand({
        Source: FROM_ADDRESS,
        Destination: { ToAddresses: [joinerEmail] },
        Message: {
          Subject: { Data: `You've joined "${questName}"!` },
          Body: {
            Text: {
              Data: `Hi there ${joinerName},\n\nYou've successfully joined the quest "${questName}". Good luck!\n\nYou can track your progress and complete tasks by logging into your account at questseeker.co.nz.\n\nNgā mihi,\nThe Quest Seeker Team${footer}`,
            },
          },
        },
      }),
    )
  }
}

export const sendPublishedEmail = async (
  creatorId: string,
  questName: string,
  profileTableName: string,
) => {
  const { Item: creatorProfile } = await ddb.send(
    new GetCommand({ TableName: profileTableName, Key: { id: creatorId } }),
  )

  const creatorName = creatorProfile?.full_name ?? 'there'
  const creatorEmail = await getEmailFromCognito(creatorId) // ✅ from Cognito
  const footer = `\n\n---\nThis is an automated transactional message. You are receiving this because you are a registered quest creator on questseeker.co.nz.`

  if (!creatorEmail) {
    console.warn('sendPublishedEmail: creator email not found')
    return
  }

  await safeSend(
    new SendEmailCommand({
      Source: FROM_ADDRESS,
      Destination: { ToAddresses: [creatorEmail] },
      Message: {
        Subject: { Data: `Your quest "${questName}" is now live!` },
        Body: {
          Text: {
            Data: `Hi there ${creatorName},\n\nGreat news! Your quest "${questName}" has been successfully published and is now live on the platform.\n\nParticipants can now find and join your quest.\n\nNgā mihi,\nThe Quest Seeker Team${footer}`,
          },
        },
      },
    }),
  )
}
