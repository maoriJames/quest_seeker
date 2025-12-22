import { defineFunction } from '@aws-amplify/backend'

export const expiredQuests = defineFunction({
  name: 'expiredQuests',
  entry: './handler.ts',
  schedule: 'every 1h',
  resourceGroupName: 'data',
})
