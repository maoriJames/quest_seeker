// import { defineFunction } from '@aws-amplify/backend'

// export const expiredQuests = defineFunction({
//   entry: './handler.ts',
// })

import { defineFunction } from '@aws-amplify/backend'

export const expiredQuests = defineFunction({
  name: 'expiredQuests',
  entry: './handler.ts',
})
