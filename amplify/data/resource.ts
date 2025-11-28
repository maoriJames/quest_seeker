import { type ClientSchema, a, defineData } from '@aws-amplify/backend'

const schema = a.schema({
  Quest: a
    .model({
      quest_name: a.string(),
      quest_details: a.string(),
      quest_image: a.string(),
      quest_image_thumb: a.string(),
      quest_start: a.date(),
      quest_end: a.date(),
      quest_prize: a.boolean(),
      quest_prize_info: a.string(),
      quest_sponsor: a.string(),
      region: a.string(),
      quest_entry: a.integer(),
      quest_tasks: a.json(),
      creator_id: a.string(),
      status: a.enum([
        'draft',
        'published',
        'expired',
        'archived',
        'upcoming',
        'occurrring',
      ]),
      participants: a.json(),
    })
    .authorization((allow) => [allow.authenticated()]),

  Profile: a
    .model({
      full_name: a.string(),
      email: a.string(),
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
      image_thumbnail: a.string(),
      my_quests: a.json(),
      role: a.enum(['seeker', 'creator']),
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
