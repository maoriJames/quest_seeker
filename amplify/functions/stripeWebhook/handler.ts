import Stripe from 'stripe'
import { env } from '$amplify/env/stripeWebhook'
import type { LambdaFunctionURLEvent } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'

const stripe = new Stripe(env.STRIPE_SECRET_KEY!)
const client = new DynamoDBClient({})
const ddb = DynamoDBDocumentClient.from(client)
const QUEST_TABLE = process.env.QUEST_TABLE_NAME!

export const handler = async (event: LambdaFunctionURLEvent) => {
  const body = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString()
    : event.body || ''

  const sig = event.headers['stripe-signature']
  let stripeEvent!: Stripe.Event

  try {
    if (!sig) throw new Error('Missing stripe-signature')
    stripeEvent = stripe.webhooks.constructEvent(
      body,
      sig,
      env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
} catch (err) {
  console.log('Webhook Error:', err instanceof Error ? err.message : err)  // 👈 add this
  return {
    statusCode: 400,
    body: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown'}`,
  }
}

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object as Stripe.Checkout.Session
    const questId = session.metadata?.questId

    if (questId) {
      const now = new Date().toISOString()

      await ddb.send(
        new UpdateCommand({
          TableName: QUEST_TABLE,
          Key: { id: questId },
          UpdateExpression:
            'SET #status = :status, published_at = :now, updatedAt = :now',
          ExpressionAttributeNames: {
            '#status': 'status',
          },
          ExpressionAttributeValues: {
            ':status': 'published',
            ':now': now,
          },
          ConditionExpression: 'attribute_exists(id)',
        }),
      )

      console.log(`Quest ${questId} successfully published`)
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) }
}
