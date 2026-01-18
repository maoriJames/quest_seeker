import { defineAuth } from '@aws-amplify/backend'
import { postRegistration } from '../functions/postRegistration/resource'
import { becomeCreator } from '../functions/becomeCreator/resource'

export const auth = defineAuth({
  loginWith: { email: true },
  triggers: {
    postConfirmation: postRegistration,
  },
  groups: ['creator', 'Admin'],
  access: (allow) => [allow.resource(becomeCreator).to(['addUserToGroup'])],
})
