// amplify/functions/becomingPending/sendEmail.ts
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'
import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider'

type Role = 'seeker' | 'creator' | 'pending'

type Profile = {
  id: string
  full_name: string
  email: string
  phone: string
  organization_name: string
  registration_number: string
  charity_number: string
  business_type: string
  organization_description: string
  primary_contact_name: string
  primary_contact_position: string
  primary_contact_phone: string
  secondary_contact_name: string
  secondary_contact_position: string
  secondary_contact_phone: string
  about_me: string
  image: string
  image_thumbnail: string
  role: Role
  points: number
}

const ses = new SESClient({ region: 'ap-southeast-2' })
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const cognito = new CognitoIdentityProviderClient({ region: 'ap-southeast-2' })

const USER_POOL_ID = process.env.AMPLIFY_USER_POOL_ID!
const FROM_ADDRESS = 'webdev@maorilandinfo.co.nz'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'webdev@maorilandinfo.co.nz'

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

export const sendCreatorApplicationEmail = async (
  userId: string,
  accountName: string,
  bankAccount: string,
  profileData: Partial<Profile>,
) => {
  const footer = `\n\n---\nThis is an automated transactional message from the Quest Seeker admin system.`

  const userName = profileData.full_name ?? 'Unknown User'
  const userEmail = await getEmailFromCognito(userId)

  const emailBody = `
New Creator Application Received

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

APPLICANT DETAILS
Name: ${userName}
Email: ${userEmail ?? 'Not available'}
User ID: ${userId}

ORGANIZATION DETAILS
Organization Name: ${profileData.organization_name ?? 'N/A'}
Business Type: ${profileData.business_type ?? 'N/A'}
${profileData.registration_number ? `Registration Number: ${profileData.registration_number}` : ''}
${profileData.charity_number ? `Charity Number: ${profileData.charity_number}` : ''}

Organization Description:
${profileData.organization_description ?? 'N/A'}

PRIMARY CONTACT
Name: ${profileData.primary_contact_name ?? 'N/A'}
Position: ${profileData.primary_contact_position ?? 'N/A'}
Phone: ${profileData.primary_contact_phone ?? 'N/A'}

${
  profileData.secondary_contact_name
    ? `SECONDARY CONTACT
Name: ${profileData.secondary_contact_name}
Position: ${profileData.secondary_contact_position ?? 'N/A'}
Phone: ${profileData.secondary_contact_phone ?? 'N/A'}
`
    : ''
}
BANK DETAILS (For Verification)
Account Name: ${accountName}
Account Number: ${bankAccount}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please review this application in the admin panel.
${footer}
  `.trim()

  await safeSend(
    new SendEmailCommand({
      Source: FROM_ADDRESS,
      Destination: { ToAddresses: [ADMIN_EMAIL] },
      Message: {
        Subject: { Data: `New Creator Application: ${userName}` },
        Body: {
          Text: { Data: emailBody },
        },
      },
    }),
  )
}

export const sendBankUpdateEmail = async (
  userId: string,
  accountName: string,
  bankAccount: string,
  profileTableName: string,
) => {
  const { Item: profile } = await ddb.send(
    new GetCommand({ TableName: profileTableName, Key: { id: userId } }),
  )

  const userName = profile?.full_name ?? 'Unknown User'
  const userEmail = await getEmailFromCognito(userId)
  const footer = `\n\n---\nThis is an automated transactional message from the Quest Seeker admin system.`

  const emailBody = `
Bank Details Update Request

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

USER DETAILS
Name: ${userName}
Email: ${userEmail ?? 'Not available'}
User ID: ${userId}

BANK DETAILS (For Verification)
Account Name: ${accountName}
Account Number: ${bankAccount}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please verify and update these bank details in the system.
${footer}
  `.trim()

  await safeSend(
    new SendEmailCommand({
      Source: FROM_ADDRESS,
      Destination: { ToAddresses: [ADMIN_EMAIL] },
      Message: {
        Subject: { Data: `Bank Details Update: ${userName}` },
        Body: {
          Text: { Data: emailBody },
        },
      },
    }),
  )
}
