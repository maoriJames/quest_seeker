import Stripe from 'stripe'
import { env } from '$amplify/env/stripeWebhook'
import type { LambdaFunctionURLEvent } from 'aws-lambda'
import { signedAppSyncFetch } from '../shared/appsyncRequest'

const stripe = new Stripe(env.STRIPE_SECRET_KEY!)

export const handler = async (event: LambdaFunctionURLEvent) => {
  const body = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString()
    : event.body || ''

  const sig = event.headers['stripe-signature']
  let stripeEvent: Stripe.Event

  try {
    if (!sig) throw new Error('Missing stripe-signature')
    stripeEvent = stripe.webhooks.constructEvent(
      body,
      sig,
      env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    return {
      statusCode: 400,
      body: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown'}`,
    }
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object as Stripe.Checkout.Session
    const questId = session.metadata?.questId

    if (questId) {
      const mutation = /* GraphQL */ `
        mutation UpdateQuest($id: ID!, $status: QuestStatus!) {
          updateQuest(input: { id: $id, status: $status }) {
            id
            status
          }
        }
      `

      // Use the helper! No amplify_outputs.json needed.
      const response = await signedAppSyncFetch(mutation, {
        id: questId,
        status: 'published',
      })

      const result = await response.json()
      console.log('Update Success:', JSON.stringify(result))
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) }
}
