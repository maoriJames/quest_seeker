import { defineFunction } from '@aws-amplify/backend'

export const expiredQuests = defineFunction({
  name: 'expiredQuests',
  entry: './handler.ts',
  schedule: [
    '0 12 * * ? *', // Midnight NZST (UTC+12)
    '0 11 * * ? *', // Midnight NZDT (UTC+13)
  ],
})
