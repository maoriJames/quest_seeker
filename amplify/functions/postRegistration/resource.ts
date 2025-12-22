import { defineFunction } from '@aws-amplify/backend'

export const postRegistration = defineFunction({
  name: 'postRegistration',
  entry: './handler.ts',
  // Grouping with auth prevents the Data <-> Auth loop
  resourceGroupName: 'auth',
})
