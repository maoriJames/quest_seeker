import { defineFunction } from '@aws-amplify/backend'

export const mutateQuest = defineFunction({
  name: 'mutateQuest',
  entry: './handler.ts',
  resourceGroupName: 'data',
})
