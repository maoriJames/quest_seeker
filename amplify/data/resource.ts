import { type ClientSchema, a, defineData } from '@aws-amplify/backend'
import { expiredQuests } from '../functions/expiredQuests/resource'
import { postRegistration } from '../functions/postRegistration/resource'
import { joinQuest } from '../functions/joinQuest/resource'
import { becomeCreator } from '../functions/becomeCreator/resource'

export const schema = a
  .schema({
    /* ------------------ CUSTOM MUTATION ------------------ */
    joinQuest: a
      .mutation()
      .arguments({
        questId: a.string().required(),
        profileId: a.string().required(),
      })
      .returns(a.boolean())
      .authorization((allow) => [allow.authenticated()])
      .handler(a.handler.function(joinQuest)),
    becomeCreator: a
      .mutation()
      .arguments({
        profileId: a.string().required(),
      })
      .returns(a.json())
      .authorization((allow) => [allow.authenticated()])
      .handler(a.handler.function(becomeCreator)),

    /* ------------------ QUEST MODEL ------------------ */
    Quest: a
      .model({
        owner: a.string(),
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
      .authorization((allow) => [
        allow.owner().to(['update', 'delete']),
        allow.groups(['Admin']).to(['create', 'update', 'delete']),
        allow.authenticated().to(['read', 'create']),
      ]),

    /* ------------------ PROFILE MODEL ------------------ */
    Profile: a
      .model({
        full_name: a.string(),
        email: a.string(),
        organization_name: a.string(),
        registration_number: a.string(),
        charity_number: a.string(),
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
      .authorization((allow) => [
        allow.owner().to(['read', 'create', 'update']),
        allow.authenticated().to(['read', 'update', 'create']),
        allow.groups(['Admin']).to(['read', 'update', 'delete']),
      ]),
  })
  .authorization((allow) => [
    // 🔗 This global block IS where you grant function access.
    // It applies IAM permissions across the data resources.
    allow.resource(joinQuest),
    allow.resource(expiredQuests).to(['query', 'mutate']),
    allow.resource(postRegistration).to(['mutate']),
    allow.resource(becomeCreator).to(['query', 'mutate']), // Ensure both are included
  ])

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
})
