import { defineFunction } from '@aws-amplify/backend'

export const becomePending = defineFunction({
  name: 'becomePending',
  entry: './handler.ts',
  resourceGroupName: 'data',
})
