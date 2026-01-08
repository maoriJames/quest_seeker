import { defineFunction } from '@aws-amplify/backend'

export const becomeCreator = defineFunction({
  name: 'becomeCreator',
  entry: './handler.ts',
})
