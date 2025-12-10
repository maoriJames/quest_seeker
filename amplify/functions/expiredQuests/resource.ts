import { defineFunction } from '@aws-amplify/backend'

export const expiredQuests = defineFunction({
  name: 'expired-quests',
  entry: './handler.ts',
})
