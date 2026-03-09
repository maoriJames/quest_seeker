import { Amplify } from 'aws-amplify' // 1. Add this
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../data/resource'
import Stripe from 'stripe'
import { env } from '$amplify/env/stripeWebhook'
import type { LambdaFunctionURLEvent } from 'aws-lambda'
import outputs from '../../../amplify_outputs.json'

// 3. Configure Amplify (This is the missing piece!)
Amplify.configure(outputs)

const stripe = new Stripe(env.STRIPE_SECRET_KEY!)
const client = generateClient<Schema>({ authMode: 'iam' })

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
    console.error('Webhook Error:', err)
    return {
      statusCode: 400,
      body: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown'}`,
    }
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object as Stripe.Checkout.Session
    const questId = session.metadata?.questId

    if (questId) {
      console.log(`🚀 Webhook received! Updating Quest: ${questId}`)

      // 4. Await and log the result
      const result = await client.models.Quest.update({
        id: questId,
        status: 'published',
      })

      console.log('Update Result:', JSON.stringify(result, null, 2))
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) }
}
