/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const becomeCreator = /* GraphQL */ `mutation BecomeCreator($profileId: String!) {
  becomeCreator(profileId: $profileId)
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
    phone
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
    phone
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
export const mutateQuest = /* GraphQL */ `mutation MutateQuest(
  $action: MutateQuestAction!
  $details: String
  $endAt: AWSDateTime
  $entryFee: Int
  $imagePath: String
  $imageThumbPath: String
  $name: String
  $prizes: AWSJSON
  $questId: String
  $region: String
  $sponsors: AWSJSON
  $startAt: AWSDateTime
  $tasks: AWSJSON
) {
  mutateQuest(
    action: $action
    details: $details
    endAt: $endAt
    entryFee: $entryFee
    imagePath: $imagePath
    imageThumbPath: $imageThumbPath
    name: $name
    prizes: $prizes
    questId: $questId
    region: $region
    sponsors: $sponsors
    startAt: $startAt
    tasks: $tasks
  ) {
    questId
    status
    __typename
  }
}
` as GeneratedMutation<
  APITypes.MutateQuestMutationVariables,
  APITypes.MutateQuestMutation
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
    phone
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
