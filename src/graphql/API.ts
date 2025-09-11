/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type Profile = {
  __typename: "Profile",
  business_type?: string | null,
  createdAt: string,
  full_name?: string | null,
  id: string,
  image?: string | null,
  my_quests?: string | null,
  organization_description?: string | null,
  organization_name?: string | null,
  primary_contact_name?: string | null,
  primary_contact_phone?: string | null,
  primary_contact_position?: string | null,
  registration_number?: string | null,
  secondary_contact_name?: string | null,
  secondary_contact_phone?: string | null,
  secondary_contact_position?: string | null,
  updatedAt: string,
};

export type ModelProfileFilterInput = {
  and?: Array< ModelProfileFilterInput | null > | null,
  business_type?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  full_name?: ModelStringInput | null,
  id?: ModelIDInput | null,
  image?: ModelStringInput | null,
  my_quests?: ModelStringInput | null,
  not?: ModelProfileFilterInput | null,
  or?: Array< ModelProfileFilterInput | null > | null,
  organization_description?: ModelStringInput | null,
  organization_name?: ModelStringInput | null,
  primary_contact_name?: ModelStringInput | null,
  primary_contact_phone?: ModelStringInput | null,
  primary_contact_position?: ModelStringInput | null,
  registration_number?: ModelStringInput | null,
  secondary_contact_name?: ModelStringInput | null,
  secondary_contact_phone?: ModelStringInput | null,
  secondary_contact_position?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelStringInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  _null = "_null",
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
}


export type ModelSizeInput = {
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
};

export type ModelIDInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export type ModelProfileConnection = {
  __typename: "ModelProfileConnection",
  items:  Array<Profile | null >,
  nextToken?: string | null,
};

export type ModelProfileConditionInput = {
  and?: Array< ModelProfileConditionInput | null > | null,
  business_type?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  full_name?: ModelStringInput | null,
  image?: ModelStringInput | null,
  my_quests?: ModelStringInput | null,
  not?: ModelProfileConditionInput | null,
  or?: Array< ModelProfileConditionInput | null > | null,
  organization_description?: ModelStringInput | null,
  organization_name?: ModelStringInput | null,
  primary_contact_name?: ModelStringInput | null,
  primary_contact_phone?: ModelStringInput | null,
  primary_contact_position?: ModelStringInput | null,
  registration_number?: ModelStringInput | null,
  secondary_contact_name?: ModelStringInput | null,
  secondary_contact_phone?: ModelStringInput | null,
  secondary_contact_position?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateProfileInput = {
  business_type?: string | null,
  full_name?: string | null,
  id?: string | null,
  image?: string | null,
  my_quests?: string | null,
  organization_description?: string | null,
  organization_name?: string | null,
  primary_contact_name?: string | null,
  primary_contact_phone?: string | null,
  primary_contact_position?: string | null,
  registration_number?: string | null,
  secondary_contact_name?: string | null,
  secondary_contact_phone?: string | null,
  secondary_contact_position?: string | null,
};

export type DeleteProfileInput = {
  id: string,
};

export type UpdateProfileInput = {
  business_type?: string | null,
  full_name?: string | null,
  id: string,
  image?: string | null,
  my_quests?: string | null,
  organization_description?: string | null,
  organization_name?: string | null,
  primary_contact_name?: string | null,
  primary_contact_phone?: string | null,
  primary_contact_position?: string | null,
  registration_number?: string | null,
  secondary_contact_name?: string | null,
  secondary_contact_phone?: string | null,
  secondary_contact_position?: string | null,
};

export type ModelSubscriptionProfileFilterInput = {
  and?: Array< ModelSubscriptionProfileFilterInput | null > | null,
  business_type?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  full_name?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  image?: ModelSubscriptionStringInput | null,
  my_quests?: ModelSubscriptionStringInput | null,
  or?: Array< ModelSubscriptionProfileFilterInput | null > | null,
  organization_description?: ModelSubscriptionStringInput | null,
  organization_name?: ModelSubscriptionStringInput | null,
  primary_contact_name?: ModelSubscriptionStringInput | null,
  primary_contact_phone?: ModelSubscriptionStringInput | null,
  primary_contact_position?: ModelSubscriptionStringInput | null,
  registration_number?: ModelSubscriptionStringInput | null,
  secondary_contact_name?: ModelSubscriptionStringInput | null,
  secondary_contact_phone?: ModelSubscriptionStringInput | null,
  secondary_contact_position?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionStringInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionIDInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type GetProfileQueryVariables = {
  id: string,
};

export type GetProfileQuery = {
  getProfile?:  {
    __typename: "Profile",
    business_type?: string | null,
    createdAt: string,
    full_name?: string | null,
    id: string,
    image?: string | null,
    my_quests?: string | null,
    organization_description?: string | null,
    organization_name?: string | null,
    primary_contact_name?: string | null,
    primary_contact_phone?: string | null,
    primary_contact_position?: string | null,
    registration_number?: string | null,
    secondary_contact_name?: string | null,
    secondary_contact_phone?: string | null,
    secondary_contact_position?: string | null,
    updatedAt: string,
  } | null,
};

export type ListProfilesQueryVariables = {
  filter?: ModelProfileFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListProfilesQuery = {
  listProfiles?:  {
    __typename: "ModelProfileConnection",
    items:  Array< {
      __typename: "Profile",
      business_type?: string | null,
      createdAt: string,
      full_name?: string | null,
      id: string,
      image?: string | null,
      my_quests?: string | null,
      organization_description?: string | null,
      organization_name?: string | null,
      primary_contact_name?: string | null,
      primary_contact_phone?: string | null,
      primary_contact_position?: string | null,
      registration_number?: string | null,
      secondary_contact_name?: string | null,
      secondary_contact_phone?: string | null,
      secondary_contact_position?: string | null,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type CreateProfileMutationVariables = {
  condition?: ModelProfileConditionInput | null,
  input: CreateProfileInput,
};

export type CreateProfileMutation = {
  createProfile?:  {
    __typename: "Profile",
    business_type?: string | null,
    createdAt: string,
    full_name?: string | null,
    id: string,
    image?: string | null,
    my_quests?: string | null,
    organization_description?: string | null,
    organization_name?: string | null,
    primary_contact_name?: string | null,
    primary_contact_phone?: string | null,
    primary_contact_position?: string | null,
    registration_number?: string | null,
    secondary_contact_name?: string | null,
    secondary_contact_phone?: string | null,
    secondary_contact_position?: string | null,
    updatedAt: string,
  } | null,
};

export type DeleteProfileMutationVariables = {
  condition?: ModelProfileConditionInput | null,
  input: DeleteProfileInput,
};

export type DeleteProfileMutation = {
  deleteProfile?:  {
    __typename: "Profile",
    business_type?: string | null,
    createdAt: string,
    full_name?: string | null,
    id: string,
    image?: string | null,
    my_quests?: string | null,
    organization_description?: string | null,
    organization_name?: string | null,
    primary_contact_name?: string | null,
    primary_contact_phone?: string | null,
    primary_contact_position?: string | null,
    registration_number?: string | null,
    secondary_contact_name?: string | null,
    secondary_contact_phone?: string | null,
    secondary_contact_position?: string | null,
    updatedAt: string,
  } | null,
};

export type UpdateProfileMutationVariables = {
  condition?: ModelProfileConditionInput | null,
  input: UpdateProfileInput,
};

export type UpdateProfileMutation = {
  updateProfile?:  {
    __typename: "Profile",
    business_type?: string | null,
    createdAt: string,
    full_name?: string | null,
    id: string,
    image?: string | null,
    my_quests?: string | null,
    organization_description?: string | null,
    organization_name?: string | null,
    primary_contact_name?: string | null,
    primary_contact_phone?: string | null,
    primary_contact_position?: string | null,
    registration_number?: string | null,
    secondary_contact_name?: string | null,
    secondary_contact_phone?: string | null,
    secondary_contact_position?: string | null,
    updatedAt: string,
  } | null,
};

export type OnCreateProfileSubscriptionVariables = {
  filter?: ModelSubscriptionProfileFilterInput | null,
};

export type OnCreateProfileSubscription = {
  onCreateProfile?:  {
    __typename: "Profile",
    business_type?: string | null,
    createdAt: string,
    full_name?: string | null,
    id: string,
    image?: string | null,
    my_quests?: string | null,
    organization_description?: string | null,
    organization_name?: string | null,
    primary_contact_name?: string | null,
    primary_contact_phone?: string | null,
    primary_contact_position?: string | null,
    registration_number?: string | null,
    secondary_contact_name?: string | null,
    secondary_contact_phone?: string | null,
    secondary_contact_position?: string | null,
    updatedAt: string,
  } | null,
};

export type OnDeleteProfileSubscriptionVariables = {
  filter?: ModelSubscriptionProfileFilterInput | null,
};

export type OnDeleteProfileSubscription = {
  onDeleteProfile?:  {
    __typename: "Profile",
    business_type?: string | null,
    createdAt: string,
    full_name?: string | null,
    id: string,
    image?: string | null,
    my_quests?: string | null,
    organization_description?: string | null,
    organization_name?: string | null,
    primary_contact_name?: string | null,
    primary_contact_phone?: string | null,
    primary_contact_position?: string | null,
    registration_number?: string | null,
    secondary_contact_name?: string | null,
    secondary_contact_phone?: string | null,
    secondary_contact_position?: string | null,
    updatedAt: string,
  } | null,
};

export type OnUpdateProfileSubscriptionVariables = {
  filter?: ModelSubscriptionProfileFilterInput | null,
};

export type OnUpdateProfileSubscription = {
  onUpdateProfile?:  {
    __typename: "Profile",
    business_type?: string | null,
    createdAt: string,
    full_name?: string | null,
    id: string,
    image?: string | null,
    my_quests?: string | null,
    organization_description?: string | null,
    organization_name?: string | null,
    primary_contact_name?: string | null,
    primary_contact_phone?: string | null,
    primary_contact_position?: string | null,
    registration_number?: string | null,
    secondary_contact_name?: string | null,
    secondary_contact_phone?: string | null,
    secondary_contact_position?: string | null,
    updatedAt: string,
  } | null,
};
