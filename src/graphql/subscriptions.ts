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
    full_name
    id
    image
    my_quests
    organization_description
    organization_name
    primary_contact_name
    primary_contact_phone
    primary_contact_position
    registration_number
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
export const onDeleteProfile = /* GraphQL */ `subscription OnDeleteProfile($filter: ModelSubscriptionProfileFilterInput) {
  onDeleteProfile(filter: $filter) {
    business_type
    createdAt
    full_name
    id
    image
    my_quests
    organization_description
    organization_name
    primary_contact_name
    primary_contact_phone
    primary_contact_position
    registration_number
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
export const onUpdateProfile = /* GraphQL */ `subscription OnUpdateProfile($filter: ModelSubscriptionProfileFilterInput) {
  onUpdateProfile(filter: $filter) {
    business_type
    createdAt
    full_name
    id
    image
    my_quests
    organization_description
    organization_name
    primary_contact_name
    primary_contact_phone
    primary_contact_position
    registration_number
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
