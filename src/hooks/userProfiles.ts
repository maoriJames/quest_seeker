import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query'
import {
  UpdateProfileMutation,
  UpdateProfileMutationVariables,
  ListProfilesQuery,
  GetProfileQuery,
  CreateProfileMutation,
} from '@/graphql/API'
import type { GraphQLResult } from '@aws-amplify/api'
import { generateClient } from 'aws-amplify/api'
import { listProfiles } from '@/graphql/queries'
import { updateProfile } from '@/graphql/mutations'
import { getCurrentUser } from 'aws-amplify/auth'
// import { Profile } from '../types'

const client = generateClient()

export const useProfileList = () => {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const result = await client.graphql({ query: listProfiles })
      return result.data.listProfiles.items
    },
  })
}

import { getProfile } from '@/graphql/queries'
import { createProfile } from '@/graphql/mutations'

export const useProfile = (
  id: string,
  options?: Omit<
    UseQueryOptions<GetProfileQuery['getProfile'] | null, Error>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<GetProfileQuery['getProfile'] | null, Error>({
    queryKey: ['profiles', id],
    queryFn: async () => {
      const result = await client.graphql<GraphQLResult<GetProfileQuery>>({
        query: getProfile,
        variables: { id },
      })

      if ('data' in result) {
        return result.data?.getProfile ?? null
      }
      return null
    },
    ...options, // safe to spread now ✅
  })
}

export const useCurrentUserProfile = () => {
  const query = useQuery({
    queryKey: ['currentProfile'],
    queryFn: async () => {
      const { userId, signInDetails } = await getCurrentUser()

      // 1. Try to fetch existing profile
      const result = (await client.graphql<GetProfileQuery>({
        query: getProfile,
        variables: { id: userId },
        authMode: 'userPool',
      })) as GraphQLResult<GetProfileQuery>

      let profile = result.data?.getProfile ?? null

      // 2. If profile doesn't exist, create one
      if (!profile) {
        const createResult = (await client.graphql<CreateProfileMutation>({
          query: createProfile,
          variables: {
            input: {
              id: userId,
              full_name: signInDetails?.loginId ?? 'New User',
            },
          },
          authMode: 'userPool',
        })) as GraphQLResult<CreateProfileMutation>

        profile = createResult.data?.createProfile ?? null
      }

      return profile
    },
  })

  return {
    currentProfile: query.data,
    currentError: query.error,
    ...query, // already contains isLoading, error, data, etc.
  }
}

export const useUpdateProfile = (
  options?: UseMutationOptions<
    UpdateProfileMutation['updateProfile'],
    unknown,
    UpdateProfileMutationVariables
  >
) => {
  const queryClient = useQueryClient()

  return useMutation<
    UpdateProfileMutation['updateProfile'],
    unknown,
    UpdateProfileMutationVariables
  >({
    mutationFn: async (variables) => {
      const result = (await client.graphql<UpdateProfileMutation>({
        query: updateProfile,
        variables,
        authMode: 'userPool',
      })) as { data: UpdateProfileMutation }

      return result.data.updateProfile
    },
    onSuccess: (data, variables, context) => {
      if (variables?.input?.id) {
        queryClient.invalidateQueries({ queryKey: ['profiles'] })
        queryClient.invalidateQueries({
          queryKey: ['profiles', variables.input.id],
        })
      }

      // Call custom onSuccess if provided
      options?.onSuccess?.(data, variables, context)
    },
    ...options, // spread any other options
  })
}

export const useUpdateSeeker = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: UpdateProfileMutationVariables) => {
      const result = (await client.graphql<UpdateProfileMutation>({
        query: updateProfile,
        variables,
      })) as { data: UpdateProfileMutation } // force-narrow to GraphQL shape

      return result.data.updateProfile
    },
    onSuccess: (_, { input }) => {
      if (input?.id) {
        queryClient.invalidateQueries({ queryKey: ['profiles'] })
        queryClient.invalidateQueries({ queryKey: ['profiles', input.id] })
      }
    },
  })
}

export const useCountSeekers = (questId: string) => {
  return useQuery({
    queryKey: ['profiles', 'count', questId],
    queryFn: async () => {
      const result = (await client.graphql<ListProfilesQuery>({
        query: listProfiles,
      })) as { data: ListProfilesQuery }

      const profiles = result.data.listProfiles?.items ?? []

      const count = profiles.filter((p) => {
        if (!p?.my_quests) return false
        let quests: { questId: string }[] = []

        try {
          quests = JSON.parse(p.my_quests)
        } catch {
          return false
        }

        return quests.some((q) => q.questId === questId)
      }).length

      return count
    },
  })
}
