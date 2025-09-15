/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type Profile = {
  __typename: 'Profile'
  business_type?: string | null
  createdAt: string
  full_name?: string | null
  id: string
  image?: string | null
  my_quests?: string | null
  organization_description?: string | null
  organization_name?: string | null
  primary_contact_name?: string | null
  primary_contact_phone?: string | null
  primary_contact_position?: string | null
  registration_number?: string | null
  secondary_contact_name?: string | null
  secondary_contact_phone?: string | null
  secondary_contact_position?: string | null
  updatedAt: string
}

export type Quest = {
  __typename: 'Quest'
  createdAt: string
  creator_id?: string | null
  id: string
  quest_details?: string | null
  quest_end?: string | null
  quest_entry?: number | null
  quest_image?: string | null
  quest_name?: string | null
  quest_prize?: string | null
  quest_prize_info?: string | null
  quest_sponsor?: string | null
  quest_start?: string | null
  quest_tasks?: string | null
  region?: string | null
  updatedAt: string
}

export type ModelProfileFilterInput = {
  and?: Array<ModelProfileFilterInput | null> | null
  business_type?: ModelStringInput | null
  createdAt?: ModelStringInput | null
  full_name?: ModelStringInput | null
  id?: ModelIDInput | null
  image?: ModelStringInput | null
  my_quests?: ModelStringInput | null
  not?: ModelProfileFilterInput | null
  or?: Array<ModelProfileFilterInput | null> | null
  organization_description?: ModelStringInput | null
  organization_name?: ModelStringInput | null
  primary_contact_name?: ModelStringInput | null
  primary_contact_phone?: ModelStringInput | null
  primary_contact_position?: ModelStringInput | null
  registration_number?: ModelStringInput | null
  secondary_contact_name?: ModelStringInput | null
  secondary_contact_phone?: ModelStringInput | null
  secondary_contact_position?: ModelStringInput | null
  updatedAt?: ModelStringInput | null
}

export type ModelStringInput = {
  attributeExists?: boolean | null
  attributeType?: ModelAttributeTypes | null
  beginsWith?: string | null
  between?: Array<string | null> | null
  contains?: string | null
  eq?: string | null
  ge?: string | null
  gt?: string | null
  le?: string | null
  lt?: string | null
  ne?: string | null
  notContains?: string | null
  size?: ModelSizeInput | null
}

export enum ModelAttributeTypes {
  _null = '_null',
  binary = 'binary',
  binarySet = 'binarySet',
  bool = 'bool',
  list = 'list',
  map = 'map',
  number = 'number',
  numberSet = 'numberSet',
  string = 'string',
  stringSet = 'stringSet',
}

export type ModelSizeInput = {
  between?: Array<number | null> | null
  eq?: number | null
  ge?: number | null
  gt?: number | null
  le?: number | null
  lt?: number | null
  ne?: number | null
}

export type ModelIDInput = {
  attributeExists?: boolean | null
  attributeType?: ModelAttributeTypes | null
  beginsWith?: string | null
  between?: Array<string | null> | null
  contains?: string | null
  eq?: string | null
  ge?: string | null
  gt?: string | null
  le?: string | null
  lt?: string | null
  ne?: string | null
  notContains?: string | null
  size?: ModelSizeInput | null
}

export type ModelProfileConnection = {
  __typename: 'ModelProfileConnection'
  items: Array<Profile | null>
  nextToken?: string | null
}

export type ModelQuestFilterInput = {
  and?: Array<ModelQuestFilterInput | null> | null
  createdAt?: ModelStringInput | null
  creator_id?: ModelStringInput | null
  id?: ModelIDInput | null
  not?: ModelQuestFilterInput | null
  or?: Array<ModelQuestFilterInput | null> | null
  quest_details?: ModelStringInput | null
  quest_end?: ModelStringInput | null
  quest_entry?: ModelIntInput | null
  quest_image?: ModelStringInput | null
  quest_name?: ModelStringInput | null
  quest_prize?: ModelStringInput | null
  quest_prize_info?: ModelStringInput | null
  quest_sponsor?: ModelStringInput | null
  quest_start?: ModelStringInput | null
  quest_tasks?: ModelStringInput | null
  region?: ModelStringInput | null
  updatedAt?: ModelStringInput | null
}

export type ModelIntInput = {
  attributeExists?: boolean | null
  attributeType?: ModelAttributeTypes | null
  between?: Array<number | null> | null
  eq?: number | null
  ge?: number | null
  gt?: number | null
  le?: number | null
  lt?: number | null
  ne?: number | null
}

export type ModelQuestConnection = {
  __typename: 'ModelQuestConnection'
  items: Array<Quest | null>
  nextToken?: string | null
}

export type ModelProfileConditionInput = {
  and?: Array<ModelProfileConditionInput | null> | null
  business_type?: ModelStringInput | null
  createdAt?: ModelStringInput | null
  full_name?: ModelStringInput | null
  image?: ModelStringInput | null
  my_quests?: ModelStringInput | null
  not?: ModelProfileConditionInput | null
  or?: Array<ModelProfileConditionInput | null> | null
  organization_description?: ModelStringInput | null
  organization_name?: ModelStringInput | null
  primary_contact_name?: ModelStringInput | null
  primary_contact_phone?: ModelStringInput | null
  primary_contact_position?: ModelStringInput | null
  registration_number?: ModelStringInput | null
  secondary_contact_name?: ModelStringInput | null
  secondary_contact_phone?: ModelStringInput | null
  secondary_contact_position?: ModelStringInput | null
  updatedAt?: ModelStringInput | null
}

export type CreateProfileInput = {
  business_type?: string | null
  full_name?: string | null
  id?: string | null
  image?: string | null
  my_quests?: string | null
  organization_description?: string | null
  organization_name?: string | null
  primary_contact_name?: string | null
  primary_contact_phone?: string | null
  primary_contact_position?: string | null
  registration_number?: string | null
  secondary_contact_name?: string | null
  secondary_contact_phone?: string | null
  secondary_contact_position?: string | null
}

export type ModelQuestConditionInput = {
  and?: Array<ModelQuestConditionInput | null> | null
  createdAt?: ModelStringInput | null
  creator_id?: ModelStringInput | null
  not?: ModelQuestConditionInput | null
  or?: Array<ModelQuestConditionInput | null> | null
  quest_details?: ModelStringInput | null
  quest_end?: ModelStringInput | null
  quest_entry?: ModelIntInput | null
  quest_image?: ModelStringInput | null
  quest_name?: ModelStringInput | null
  quest_prize?: ModelStringInput | null
  quest_prize_info?: ModelStringInput | null
  quest_sponsor?: ModelStringInput | null
  quest_start?: ModelStringInput | null
  quest_tasks?: ModelStringInput | null
  region?: ModelStringInput | null
  updatedAt?: ModelStringInput | null
}

export type CreateQuestInput = {
  creator_id?: string | null
  id?: string | null
  quest_details?: string | null
  quest_end?: string | null
  quest_entry?: number | null
  quest_image?: string | null
  quest_name?: string | null
  quest_prize?: string | null
  quest_prize_info?: string | null
  quest_sponsor?: string | null
  quest_start?: string | null
  quest_tasks?: string | null
  region?: string | null
}

export type DeleteProfileInput = {
  id: string
}

export type DeleteQuestInput = {
  id: string
}

export type UpdateProfileInput = {
  business_type?: string | null
  full_name?: string | null
  id: string
  image?: string | null
  my_quests?: string | null
  organization_description?: string | null
  organization_name?: string | null
  primary_contact_name?: string | null
  primary_contact_phone?: string | null
  primary_contact_position?: string | null
  registration_number?: string | null
  secondary_contact_name?: string | null
  secondary_contact_phone?: string | null
  secondary_contact_position?: string | null
}

export type UpdateQuestInput = {
  creator_id?: string | null
  id: string
  quest_details?: string | null
  quest_end?: string | null
  quest_entry?: number | null
  quest_image?: string | null
  quest_name?: string | null
  quest_prize?: string | null
  quest_prize_info?: string | null
  quest_sponsor?: string | null
  quest_start?: string | null
  quest_tasks?: string | null
  region?: string | null
}

export type ModelSubscriptionProfileFilterInput = {
  and?: Array<ModelSubscriptionProfileFilterInput | null> | null
  business_type?: ModelSubscriptionStringInput | null
  createdAt?: ModelSubscriptionStringInput | null
  full_name?: ModelSubscriptionStringInput | null
  id?: ModelSubscriptionIDInput | null
  image?: ModelSubscriptionStringInput | null
  my_quests?: ModelSubscriptionStringInput | null
  or?: Array<ModelSubscriptionProfileFilterInput | null> | null
  organization_description?: ModelSubscriptionStringInput | null
  organization_name?: ModelSubscriptionStringInput | null
  primary_contact_name?: ModelSubscriptionStringInput | null
  primary_contact_phone?: ModelSubscriptionStringInput | null
  primary_contact_position?: ModelSubscriptionStringInput | null
  registration_number?: ModelSubscriptionStringInput | null
  secondary_contact_name?: ModelSubscriptionStringInput | null
  secondary_contact_phone?: ModelSubscriptionStringInput | null
  secondary_contact_position?: ModelSubscriptionStringInput | null
  updatedAt?: ModelSubscriptionStringInput | null
}

export type ModelSubscriptionStringInput = {
  beginsWith?: string | null
  between?: Array<string | null> | null
  contains?: string | null
  eq?: string | null
  ge?: string | null
  gt?: string | null
  in?: Array<string | null> | null
  le?: string | null
  lt?: string | null
  ne?: string | null
  notContains?: string | null
  notIn?: Array<string | null> | null
}

export type ModelSubscriptionIDInput = {
  beginsWith?: string | null
  between?: Array<string | null> | null
  contains?: string | null
  eq?: string | null
  ge?: string | null
  gt?: string | null
  in?: Array<string | null> | null
  le?: string | null
  lt?: string | null
  ne?: string | null
  notContains?: string | null
  notIn?: Array<string | null> | null
}

export type ModelSubscriptionQuestFilterInput = {
  and?: Array<ModelSubscriptionQuestFilterInput | null> | null
  createdAt?: ModelSubscriptionStringInput | null
  creator_id?: ModelSubscriptionStringInput | null
  id?: ModelSubscriptionIDInput | null
  or?: Array<ModelSubscriptionQuestFilterInput | null> | null
  quest_details?: ModelSubscriptionStringInput | null
  quest_end?: ModelSubscriptionStringInput | null
  quest_entry?: ModelSubscriptionIntInput | null
  quest_image?: ModelSubscriptionStringInput | null
  quest_name?: ModelSubscriptionStringInput | null
  quest_prize?: ModelSubscriptionStringInput | null
  quest_prize_info?: ModelSubscriptionStringInput | null
  quest_sponsor?: ModelSubscriptionStringInput | null
  quest_start?: ModelSubscriptionStringInput | null
  quest_tasks?: ModelSubscriptionStringInput | null
  region?: ModelSubscriptionStringInput | null
  updatedAt?: ModelSubscriptionStringInput | null
}

export type ModelSubscriptionIntInput = {
  between?: Array<number | null> | null
  eq?: number | null
  ge?: number | null
  gt?: number | null
  in?: Array<number | null> | null
  le?: number | null
  lt?: number | null
  ne?: number | null
  notIn?: Array<number | null> | null
}

export type GetProfileQueryVariables = {
  id: string
}

export type GetProfileQuery = {
  getProfile?: {
    __typename: 'Profile'
    business_type?: string | null
    createdAt: string
    full_name?: string | null
    id: string
    image?: string | null
    my_quests?: string | null
    organization_description?: string | null
    organization_name?: string | null
    primary_contact_name?: string | null
    primary_contact_phone?: string | null
    primary_contact_position?: string | null
    registration_number?: string | null
    secondary_contact_name?: string | null
    secondary_contact_phone?: string | null
    secondary_contact_position?: string | null
    updatedAt: string
  } | null
}

export type GetQuestQueryVariables = {
  id: string
}

export type GetQuestQuery = {
  getQuest?: {
    __typename: 'Quest'
    createdAt: string
    creator_id?: string | null
    id: string
    quest_details?: string | null
    quest_end?: string | null
    quest_entry?: number | null
    quest_image?: string | null
    quest_name?: string | null
    quest_prize?: string | null
    quest_prize_info?: string | null
    quest_sponsor?: string | null
    quest_start?: string | null
    quest_tasks?: string | null
    region?: string | null
    updatedAt: string
  } | null
}

export type ListProfilesQueryVariables = {
  filter?: ModelProfileFilterInput | null
  limit?: number | null
  nextToken?: string | null
}

export type ListProfilesQuery = {
  listProfiles?: {
    __typename: 'ModelProfileConnection'
    items: Array<{
      __typename: 'Profile'
      business_type?: string | null
      createdAt: string
      full_name?: string | null
      id: string
      image?: string | null
      my_quests?: string | null
      organization_description?: string | null
      organization_name?: string | null
      primary_contact_name?: string | null
      primary_contact_phone?: string | null
      primary_contact_position?: string | null
      registration_number?: string | null
      secondary_contact_name?: string | null
      secondary_contact_phone?: string | null
      secondary_contact_position?: string | null
      updatedAt: string
    } | null>
    nextToken?: string | null
  } | null
}

export type ListQuestsQueryVariables = {
  filter?: ModelQuestFilterInput | null
  limit?: number | null
  nextToken?: string | null
}

export type ListQuestsQuery = {
  listQuests?: {
    __typename: 'ModelQuestConnection'
    items: Array<{
      __typename: 'Quest'
      createdAt: string
      creator_id?: string | null
      id: string
      quest_details?: string | null
      quest_end?: string | null
      quest_entry?: number | null
      quest_image?: string | null
      quest_name?: string | null
      quest_prize?: string | null
      quest_prize_info?: string | null
      quest_sponsor?: string | null
      quest_start?: string | null
      quest_tasks?: string | null
      region?: string | null
      updatedAt: string
    } | null>
    nextToken?: string | null
  } | null
}

export type CreateProfileMutationVariables = {
  condition?: ModelProfileConditionInput | null
  input: CreateProfileInput
}

export type CreateProfileMutation = {
  createProfile?: {
    __typename: 'Profile'
    business_type?: string | null
    createdAt: string
    full_name?: string | null
    id: string
    image?: string | null
    my_quests?: string | null
    organization_description?: string | null
    organization_name?: string | null
    primary_contact_name?: string | null
    primary_contact_phone?: string | null
    primary_contact_position?: string | null
    registration_number?: string | null
    secondary_contact_name?: string | null
    secondary_contact_phone?: string | null
    secondary_contact_position?: string | null
    updatedAt: string
  } | null
}

export type CreateQuestMutationVariables = {
  condition?: ModelQuestConditionInput | null
  input: CreateQuestInput
}

export type CreateQuestMutation = {
  createQuest?: {
    __typename: 'Quest'
    createdAt: string
    creator_id?: string | null
    id: string
    quest_details?: string | null
    quest_end?: string | null
    quest_entry?: number | null
    quest_image?: string | null
    quest_name?: string | null
    quest_prize?: string | null
    quest_prize_info?: string | null
    quest_sponsor?: string | null
    quest_start?: string | null
    quest_tasks?: string | null
    region?: string | null
    updatedAt: string
  } | null
}

export type DeleteProfileMutationVariables = {
  condition?: ModelProfileConditionInput | null
  input: DeleteProfileInput
}

export type DeleteProfileMutation = {
  deleteProfile?: {
    __typename: 'Profile'
    business_type?: string | null
    createdAt: string
    full_name?: string | null
    id: string
    image?: string | null
    my_quests?: string | null
    organization_description?: string | null
    organization_name?: string | null
    primary_contact_name?: string | null
    primary_contact_phone?: string | null
    primary_contact_position?: string | null
    registration_number?: string | null
    secondary_contact_name?: string | null
    secondary_contact_phone?: string | null
    secondary_contact_position?: string | null
    updatedAt: string
  } | null
}

export type DeleteQuestMutationVariables = {
  condition?: ModelQuestConditionInput | null
  input: DeleteQuestInput
}

export type DeleteQuestMutation = {
  deleteQuest?: {
    __typename: 'Quest'
    createdAt: string
    creator_id?: string | null
    id: string
    quest_details?: string | null
    quest_end?: string | null
    quest_entry?: number | null
    quest_image?: string | null
    quest_name?: string | null
    quest_prize?: string | null
    quest_prize_info?: string | null
    quest_sponsor?: string | null
    quest_start?: string | null
    quest_tasks?: string | null
    region?: string | null
    updatedAt: string
  } | null
}

export type UpdateProfileMutationVariables = {
  condition?: ModelProfileConditionInput | null
  input: UpdateProfileInput
}

export type UpdateProfileMutation = {
  updateProfile?: {
    __typename: 'Profile'
    business_type?: string | null
    createdAt: string
    full_name?: string | null
    id: string
    image?: string | null
    my_quests?: string | null
    organization_description?: string | null
    organization_name?: string | null
    primary_contact_name?: string | null
    primary_contact_phone?: string | null
    primary_contact_position?: string | null
    registration_number?: string | null
    secondary_contact_name?: string | null
    secondary_contact_phone?: string | null
    secondary_contact_position?: string | null
    updatedAt: string
  } | null
}

export type UpdateQuestMutationVariables = {
  condition?: ModelQuestConditionInput | null
  input: UpdateQuestInput
}

export type UpdateQuestMutation = {
  updateQuest?: {
    __typename: 'Quest'
    createdAt: string
    creator_id?: string | null
    id: string
    quest_details?: string | null
    quest_end?: string | null
    quest_entry?: number | null
    quest_image?: string | null
    quest_name?: string | null
    quest_prize?: string | null
    quest_prize_info?: string | null
    quest_sponsor?: string | null
    quest_start?: string | null
    quest_tasks?: string | null
    region?: string | null
    updatedAt: string
  } | null
}

export type OnCreateProfileSubscriptionVariables = {
  filter?: ModelSubscriptionProfileFilterInput | null
}

export type OnCreateProfileSubscription = {
  onCreateProfile?: {
    __typename: 'Profile'
    business_type?: string | null
    createdAt: string
    full_name?: string | null
    id: string
    image?: string | null
    my_quests?: string | null
    organization_description?: string | null
    organization_name?: string | null
    primary_contact_name?: string | null
    primary_contact_phone?: string | null
    primary_contact_position?: string | null
    registration_number?: string | null
    secondary_contact_name?: string | null
    secondary_contact_phone?: string | null
    secondary_contact_position?: string | null
    updatedAt: string
  } | null
}

export type OnCreateQuestSubscriptionVariables = {
  filter?: ModelSubscriptionQuestFilterInput | null
}

export type OnCreateQuestSubscription = {
  onCreateQuest?: {
    __typename: 'Quest'
    createdAt: string
    creator_id?: string | null
    id: string
    quest_details?: string | null
    quest_end?: string | null
    quest_entry?: number | null
    quest_image?: string | null
    quest_name?: string | null
    quest_prize?: string | null
    quest_prize_info?: string | null
    quest_sponsor?: string | null
    quest_start?: string | null
    quest_tasks?: string | null
    region?: string | null
    updatedAt: string
  } | null
}

export type OnDeleteProfileSubscriptionVariables = {
  filter?: ModelSubscriptionProfileFilterInput | null
}

export type OnDeleteProfileSubscription = {
  onDeleteProfile?: {
    __typename: 'Profile'
    business_type?: string | null
    createdAt: string
    full_name?: string | null
    id: string
    image?: string | null
    my_quests?: string | null
    organization_description?: string | null
    organization_name?: string | null
    primary_contact_name?: string | null
    primary_contact_phone?: string | null
    primary_contact_position?: string | null
    registration_number?: string | null
    secondary_contact_name?: string | null
    secondary_contact_phone?: string | null
    secondary_contact_position?: string | null
    updatedAt: string
  } | null
}

export type OnDeleteQuestSubscriptionVariables = {
  filter?: ModelSubscriptionQuestFilterInput | null
}

export type OnDeleteQuestSubscription = {
  onDeleteQuest?: {
    __typename: 'Quest'
    createdAt: string
    creator_id?: string | null
    id: string
    quest_details?: string | null
    quest_end?: string | null
    quest_entry?: number | null
    quest_image?: string | null
    quest_name?: string | null
    quest_prize?: string | null
    quest_prize_info?: string | null
    quest_sponsor?: string | null
    quest_start?: string | null
    quest_tasks?: string | null
    region?: string | null
    updatedAt: string
  } | null
}

export type OnUpdateProfileSubscriptionVariables = {
  filter?: ModelSubscriptionProfileFilterInput | null
}

export type OnUpdateProfileSubscription = {
  onUpdateProfile?: {
    __typename: 'Profile'
    business_type?: string | null
    createdAt: string
    full_name?: string | null
    id: string
    image?: string | null
    my_quests?: string | null
    organization_description?: string | null
    organization_name?: string | null
    primary_contact_name?: string | null
    primary_contact_phone?: string | null
    primary_contact_position?: string | null
    registration_number?: string | null
    secondary_contact_name?: string | null
    secondary_contact_phone?: string | null
    secondary_contact_position?: string | null
    updatedAt: string
  } | null
}

export type OnUpdateQuestSubscriptionVariables = {
  filter?: ModelSubscriptionQuestFilterInput | null
}

export type OnUpdateQuestSubscription = {
  onUpdateQuest?: {
    __typename: 'Quest'
    createdAt: string
    creator_id?: string | null
    id: string
    quest_details?: string | null
    quest_end?: string | null
    quest_entry?: number | null
    quest_image?: string | null
    quest_name?: string | null
    quest_prize?: string | null
    quest_prize_info?: string | null
    quest_sponsor?: string | null
    quest_start?: string | null
    quest_tasks?: string | null
    region?: string | null
    updatedAt: string
  } | null
}
