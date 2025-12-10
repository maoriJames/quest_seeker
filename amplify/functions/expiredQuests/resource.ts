import { defineFunction } from '@aws-amplify/backend'

export const expiredQuests = defineFunction({
  entry: './handler.ts',
})
