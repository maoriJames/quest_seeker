import { defineAuth } from '@aws-amplify/backend'
import { postRegistration } from '../functions/postRegistration/resource'

export const auth = defineAuth({
  loginWith: { email: true },
  triggers: {
    postConfirmation: postRegistration,
  },
})
