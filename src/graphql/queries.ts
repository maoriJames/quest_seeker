/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getProfile = /* GraphQL */ `query GetProfile($id: ID!) {
  getProfile(id: $id) {
    business_type
    createdAt
    email
    full_name
    id
    image
    image_thumbnail
    my_quests
    organization_description
    organization_name
    primary_contact_name
    primary_contact_phone
    primary_contact_position
    registration_number
    role
    secondary_contact_name
    secondary_contact_phone
    secondary_contact_position
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetProfileQueryVariables,
  APITypes.GetProfileQuery
>;
export const getQuest = /* GraphQL */ `query GetQuest($id: ID!) {
  getQuest(id: $id) {
    createdAt
    creator_id
    id
    participants
    quest_details
    quest_end
    quest_entry
    quest_image
    quest_image_thumb
    quest_name
    quest_prize
    quest_prize_info
    quest_sponsor
    quest_start
    quest_tasks
    region
    status
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetQuestQueryVariables, APITypes.GetQuestQuery>;
export const listProfiles = /* GraphQL */ `query ListProfiles(
  $filter: ModelProfileFilterInput
  $limit: Int
  $nextToken: String
) {
  listProfiles(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      business_type
      createdAt
      email
      full_name
      id
      image
      image_thumbnail
      my_quests
      organization_description
      organization_name
      primary_contact_name
      primary_contact_phone
      primary_contact_position
      registration_number
      role
      secondary_contact_name
      secondary_contact_phone
      secondary_contact_position
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListProfilesQueryVariables,
  APITypes.ListProfilesQuery
>;
export const listQuests = /* GraphQL */ `query ListQuests(
  $filter: ModelQuestFilterInput
  $limit: Int
  $nextToken: String
) {
  listQuests(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      createdAt
      creator_id
      id
      participants
      quest_details
      quest_end
      quest_entry
      quest_image
      quest_image_thumb
      quest_name
      quest_prize
      quest_prize_info
      quest_sponsor
      quest_start
      quest_tasks
      region
      status
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListQuestsQueryVariables,
  APITypes.ListQuestsQuery
>;
