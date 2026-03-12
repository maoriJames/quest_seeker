// amplify/functions/createQuestEntrySession/handler.ts
import type { Schema } from '../../data/resource'
import Stripe from 'stripe'
import { env } from '$amplify/env/createQuestEntrySession'

const stripe = new Stripe(env.STRIPE_SECRET_KEY!)

export const handler: Schema['createQuestEntrySession']['functionHandler'] =
  async (event) => {
    const { questId, profileId, questName, entryFee, returnUrl } =
      event.arguments

    if (!questId || !profileId || !entryFee) {
      throw new Error('Missing required arguments')
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'nzd',
            product_data: {
              name: `Quest Entry: ${questName}`,
              description: `Joining quest: ${questName}`,
            },
            unit_amount: entryFee * 100, // dollars to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}&questId=${questId}`,
      cancel_url: returnUrl,
      metadata: {
        questId,
        profileId,
        type: 'quest_entry', // 👈 distinguishes from publication payments in webhook
      },
    })

    return session.url as string
  }
