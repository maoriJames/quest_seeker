/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const becomeCreator = /* GraphQL */ `mutation BecomeCreator {
  becomeCreator
}
` as GeneratedMutation<
  APITypes.BecomeCreatorMutationVariables,
  APITypes.BecomeCreatorMutation
>;
export const createProfile = /* GraphQL */ `mutation CreateProfile(
  $condition: ModelProfileConditionInput
  $input: CreateProfileInput!
) {
  createProfile(condition: $condition, input: $input) {
    about_me
    business_type
    charity_number
    createdAt
    email
    full_name
    id
    image
    image_thumbnail
    leaderboard
    my_quests
    organization_description
    organization_name
    owner
    points
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
` as GeneratedMutation<
  APITypes.CreateProfileMutationVariables,
  APITypes.CreateProfileMutation
>;
export const createQuest = /* GraphQL */ `mutation CreateQuest(
  $condition: ModelQuestConditionInput
  $input: CreateQuestInput!
) {
  createQuest(condition: $condition, input: $input) {
    createdAt
    creator_id
    id
    owner
    participants
    quest_details
    quest_end_at
    quest_entry
    quest_image
    quest_image_thumb
    quest_name
    quest_prize
    quest_prize_info
    quest_sponsor
    quest_start_at
    quest_tasks
    region
    status
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateQuestMutationVariables,
  APITypes.CreateQuestMutation
>;
export const deleteProfile = /* GraphQL */ `mutation DeleteProfile(
  $condition: ModelProfileConditionInput
  $input: DeleteProfileInput!
) {
  deleteProfile(condition: $condition, input: $input) {
    about_me
    business_type
    charity_number
    createdAt
    email
    full_name
    id
    image
    image_thumbnail
    leaderboard
    my_quests
    organization_description
    organization_name
    owner
    points
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
` as GeneratedMutation<
  APITypes.DeleteProfileMutationVariables,
  APITypes.DeleteProfileMutation
>;
export const deleteQuest = /* GraphQL */ `mutation DeleteQuest(
  $condition: ModelQuestConditionInput
  $input: DeleteQuestInput!
) {
  deleteQuest(condition: $condition, input: $input) {
    createdAt
    creator_id
    id
    owner
    participants
    quest_details
    quest_end_at
    quest_entry
    quest_image
    quest_image_thumb
    quest_name
    quest_prize
    quest_prize_info
    quest_sponsor
    quest_start_at
    quest_tasks
    region
    status
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteQuestMutationVariables,
  APITypes.DeleteQuestMutation
>;
export const joinQuest = /* GraphQL */ `mutation JoinQuest($profileId: String!, $questId: String!) {
  joinQuest(profileId: $profileId, questId: $questId)
}
` as GeneratedMutation<
  APITypes.JoinQuestMutationVariables,
  APITypes.JoinQuestMutation
>;
export const updateProfile = /* GraphQL */ `mutation UpdateProfile(
  $condition: ModelProfileConditionInput
  $input: UpdateProfileInput!
) {
  updateProfile(condition: $condition, input: $input) {
    about_me
    business_type
    charity_number
    createdAt
    email
    full_name
    id
    image
    image_thumbnail
    leaderboard
    my_quests
    organization_description
    organization_name
    owner
    points
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
` as GeneratedMutation<
  APITypes.UpdateProfileMutationVariables,
  APITypes.UpdateProfileMutation
>;
export const updateQuest = /* GraphQL */ `mutation UpdateQuest(
  $condition: ModelQuestConditionInput
  $input: UpdateQuestInput!
) {
  updateQuest(condition: $condition, input: $input) {
    createdAt
    creator_id
    id
    owner
    participants
    quest_details
    quest_end_at
    quest_entry
    quest_image
    quest_image_thumb
    quest_name
    quest_prize
    quest_prize_info
    quest_sponsor
    quest_start_at
    quest_tasks
    region
    status
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateQuestMutationVariables,
  APITypes.UpdateQuestMutation
>;
