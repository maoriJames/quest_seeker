import { defineStorage } from '@aws-amplify/backend'

export const storage = defineStorage({
  name: 'amplifyQuestSeeker',
  access: (allow) => ({
    'public/*': [
      allow.authenticated.to(['read', 'write']), // optional
      allow.groups(['creator']).to(['read', 'write', 'delete']),
    ],
  }),
})
