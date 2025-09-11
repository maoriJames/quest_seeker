import { type ClientSchema, a, defineData } from '@aws-amplify/backend'

const schema = a.schema({
  Profile: a
    .model({
      full_name: a.string(),
      organization_name: a.string(),
      registration_number: a.string(),
      business_type: a.string(),
      organization_description: a.string(),
      primary_contact_name: a.string(),
      primary_contact_position: a.string(),
      primary_contact_phone: a.string(),
      secondary_contact_name: a.string(),
      secondary_contact_position: a.string(),
      secondary_contact_phone: a.string(),
      image: a.string(),
      my_quests: a.json(),
    })
    .authorization((allow) => [allow.authenticated()]),
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'identityPool',
  },
})
