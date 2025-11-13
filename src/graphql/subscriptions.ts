/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateProfile = /* GraphQL */ `subscription OnCreateProfile($filter: ModelSubscriptionProfileFilterInput) {
  onCreateProfile(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateProfileSubscriptionVariables,
  APITypes.OnCreateProfileSubscription
>;
export const onCreateQuest = /* GraphQL */ `subscription OnCreateQuest($filter: ModelSubscriptionQuestFilterInput) {
  onCreateQuest(filter: $filter) {
    createdAt
    creator_id
    id
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
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateQuestSubscriptionVariables,
  APITypes.OnCreateQuestSubscription
>;
export const onDeleteProfile = /* GraphQL */ `subscription OnDeleteProfile($filter: ModelSubscriptionProfileFilterInput) {
  onDeleteProfile(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteProfileSubscriptionVariables,
  APITypes.OnDeleteProfileSubscription
>;
export const onDeleteQuest = /* GraphQL */ `subscription OnDeleteQuest($filter: ModelSubscriptionQuestFilterInput) {
  onDeleteQuest(filter: $filter) {
    createdAt
    creator_id
    id
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
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteQuestSubscriptionVariables,
  APITypes.OnDeleteQuestSubscription
>;
export const onUpdateProfile = /* GraphQL */ `subscription OnUpdateProfile($filter: ModelSubscriptionProfileFilterInput) {
  onUpdateProfile(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateProfileSubscriptionVariables,
  APITypes.OnUpdateProfileSubscription
>;
export const onUpdateQuest = /* GraphQL */ `subscription OnUpdateQuest($filter: ModelSubscriptionQuestFilterInput) {
  onUpdateQuest(filter: $filter) {
    createdAt
    creator_id
    id
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
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateQuestSubscriptionVariables,
  APITypes.OnUpdateQuestSubscription
>;
