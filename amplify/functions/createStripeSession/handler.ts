import type { Schema } from '../../data/resource'
import Stripe from 'stripe'
import { env } from '$amplify/env/createStripeSession'
import { signedAppSyncFetch } from '../shared/appsyncRequest'

const stripe = new Stripe(env.STRIPE_SECRET_KEY!)

export const handler: Schema['createStripeSession']['functionHandler'] = async (
  event,
) => {
  const { questId, profileId, returnUrl } = event.arguments

  // 1. Logic: Map business types to prices (in cents for Stripe)
  const priceMap: Record<string, number> = {
    'Registered Company': 95000,
    'Small Business': 29900,
    'Charitable Trust': 5000,
    'Not for Profit': 5000,
    'Whanau Fund Raising': 5000,
    'Registered Charity': 5000,
  }

  const query = /* GraphQL */ `
    query GetProfile($id: ID!) {
      getProfile(id: $id) {
        id
        business_type
      }
    }
  `

  // Execute the signed fetch
  const response = await signedAppSyncFetch(query, { id: profileId })
  const result = await response.json()

  // ⚠️ IMPORTANT: Access via result.data.getProfile
  const profile = result.data?.getProfile

  if (!profile) {
    // If result.errors exists, it's a permission issue.
    // If result.data.getProfile is null, the ID doesn't exist.
    console.error('AppSync Error Details:', JSON.stringify(result.errors))
    throw new Error(`Profile not found: ${profileId}`)
  }

  const businessType = profile.business_type
  const amount = priceMap[businessType] ?? 5000

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'nzd',
          product_data: {
            name: `Quest Publication: ${questId}`,
            description: `Business Tier: ${businessType}`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: returnUrl,
    metadata: { questId, profileId },
  })

  return session.url as string
}
