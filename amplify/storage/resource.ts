import { defineStorage } from '@aws-amplify/backend'

export const storage = defineStorage({
  name: 'amplifyQuestSeeker',
  access: (allow) => ({
    // Allow authenticated users to read and write anywhere
    'private/*': [allow.authenticated.to(['read', 'write'])],

    // Allow anyone (even unauthenticated users) to read public files
    'public/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write']),
    ],
  }),
})
