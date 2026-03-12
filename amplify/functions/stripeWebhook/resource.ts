import { defineFunction, secret } from '@aws-amplify/backend'

export const stripeWebhook = defineFunction({
  name: 'stripeWebhook',
  entry: './handler.ts',
  resourceGroupName: 'data',
  environment: {
    STRIPE_SECRET_KEY: secret('STRIPE_SECRET_KEY'),
    STRIPE_WEBHOOK_SECRET: secret('STRIPE_WEBHOOK_SECRET'),
    //     QUEST_TABLE_NAME,
    // USER_QUEST_TABLE_NAME,
    // PROFILE_TABLE_NAME,
  },
})
