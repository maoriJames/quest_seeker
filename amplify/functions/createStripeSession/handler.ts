import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../data/resource'
import Stripe from 'stripe'
import { env } from '$amplify/env/createStripeSession'
import outputs from '../../../amplify_outputs.json'

Amplify.configure(outputs)

const stripe = new Stripe(env.STRIPE_SECRET_KEY!)
const client = generateClient<Schema>({
  authMode: 'iam',
})

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

  const { data: profile, errors } = await client.models.Profile.get({
    id: profileId,
  })

  const profileResponse = await client.models.Profile.get({ id: profileId })
  console.log(
    'Full AppSync Response:',
    JSON.stringify(profileResponse, null, 2),
  )

  if (!profileResponse.data) {
    // If data is null but there are errors, it's a permission issue
    // If data is null and NO errors, the ID simply doesn't exist in that table
    throw new Error(
      `Profile not found in DB for ID: ${profileId}. Errors: ${JSON.stringify(profileResponse.errors)}`,
    )
  }

  if (errors || !profile) {
    throw new Error(`Could not find profile with ID: ${profileId}`)
  }

  // 1. Fetch the type, default to empty string if null
  const businessType = profile.business_type ?? ''

  // 2. Check if it exists in your map, otherwise default to 5000 ($50)
  const amount = businessType in priceMap ? priceMap[businessType] : 5000

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'nzd', // Good call on NZD!
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
