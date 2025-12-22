import { type ClientSchema, a, defineData } from '@aws-amplify/backend'
import { expiredQuests } from '../functions/expiredQuests/resource'

export const schema = a
  .schema({
    Quest: a
      .model({
        quest_name: a.string(),
        quest_details: a.string(),
        quest_image: a.string(),
        quest_image_thumb: a.string(),
        quest_start_at: a.datetime(),
        quest_end_at: a.datetime(),
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
          'completed',
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
        about_me: a.string(),
        secondary_contact_name: a.string(),
        secondary_contact_position: a.string(),
        secondary_contact_phone: a.string(),
        image: a.string(),
        image_thumbnail: a.string(),
        my_quests: a.json(),
        points: a.integer(),
        leaderboard: a.string().default('GLOBAL'),
        role: a.enum(['seeker', 'creator']),
      })
      .secondaryIndexes((index) => [
        index('leaderboard').sortKeys(['points']).queryField('listLeaderboard'),
      ])

      .authorization((allow) => [allow.authenticated()]),
  })
  .authorization((allow) => [
    allow.resource(expiredQuests).to(['query', 'mutate']),
  ])
export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
})
