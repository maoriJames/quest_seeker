// amplify/functions/createQuestEntrySession/resource.ts
import { defineFunction, secret } from '@aws-amplify/backend'

export const createQuestEntrySession = defineFunction({
  name: 'createQuestEntrySession',
  entry: './handler.ts',
  resourceGroupName: 'data',
  environment: {
    STRIPE_SECRET_KEY: secret('STRIPE_SECRET_KEY'),
  },
})
