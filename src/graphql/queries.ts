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
` as GeneratedQuery<
  APITypes.GetProfileQueryVariables,
  APITypes.GetProfileQuery
>;
export const listProfiles = /* GraphQL */ `query ListProfiles(
  $filter: ModelProfileFilterInput
  $limit: Int
  $nextToken: String
) {
  listProfiles(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListProfilesQueryVariables,
  APITypes.ListProfilesQuery
>;
