import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider'

const ses = new SESClient({ region: 'ap-southeast-2' })
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

export const sendQuestExpiredEmail = async (
  creatorId: string,
  questName: string,
  questId: string,
) => {
  const creatorEmail = await getEmailFromCognito(creatorId)

  if (!creatorEmail) {
    console.warn(
      'sendQuestExpiredEmail: creator email not found for',
      creatorId,
    )
    return
  }

  const questUrl = `https://questseeker.co.nz/user/quest/${questId}`
  const footer = `\n\n---\nThis is an automated transactional message. You are receiving this because you are a registered quest creator on questseeker.co.nz.`

  await safeSend(
    new SendEmailCommand({
      Source: FROM_ADDRESS,
      Destination: { ToAddresses: [creatorEmail] },
      Message: {
        Subject: { Data: `Your quest "${questName}" has expired` },
        Body: {
          Text: {
            Data: `Kia ora!\n\nYour quest "${questName}" has now expired. You can view the results and pick a winner by visiting the quest page:\n\n${questUrl}\n\nNgā mihi,\nThe QuestSeeker Team${footer}`,
          },
        },
      },
    }),
  )
}
