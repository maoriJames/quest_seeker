import { defineFunction } from '@aws-amplify/backend'

export const mutateQuest = defineFunction({
  entry: './handler.ts',
  resourceGroupName: 'data',
})
