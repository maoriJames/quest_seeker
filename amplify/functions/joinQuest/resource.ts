import { defineFunction } from '@aws-amplify/backend'

export const joinQuest = defineFunction({
  name: 'joinQuest',
  entry: './handler.ts',
})
