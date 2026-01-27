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
import { listProfiles, getProfile } from '@/graphql/queries'
import { updateProfile, createProfile } from '@/graphql/mutations'
import { getCurrentUser } from 'aws-amplify/auth'
import { profileKeys } from '@/queryKeys'

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

export const useProfile = (
  id: string,
  options?: Omit<
    UseQueryOptions<GetProfileQuery['getProfile'] | null, Error>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery<GetProfileQuery['getProfile'] | null, Error>({
    queryKey: ['profiles', id],
    queryFn: async () => {
      if (!id) return null // ✅ skip if no id

      const result = await client.graphql<GraphQLResult<GetProfileQuery>>({
        query: getProfile,
        variables: { id },
        authMode: 'userPool', // ✅ force Cognito auth
      })

      if ('data' in result) {
        return result.data?.getProfile ?? null
      }
      return null
    },
    enabled: !!id, // ✅ don’t run if id is falsy
    ...options,
  })
}

export const useCurrentUserProfile = () => {
  const query = useQuery({
    queryKey: profileKeys.current,
    queryFn: async () => {
      const { userId, signInDetails } = await getCurrentUser()

      // 1️⃣ Fetch profile
      const res = await client.graphql<GetProfileQuery>({
        query: getProfile,
        variables: { id: userId },
        authMode: 'userPool',
      })

      let profile = 'data' in res ? (res.data?.getProfile ?? null) : null

      // 2️⃣ Create profile if missing
      if (!profile) {
        const createRes = await client.graphql<CreateProfileMutation>({
          query: createProfile,
          variables: {
            input: {
              id: userId,
              full_name: signInDetails?.loginId ?? 'New User',
              role: 'seeker',
            },
          },
          authMode: 'userPool',
        })

        profile =
          'data' in createRes ? (createRes.data?.createProfile ?? null) : null
      }

      return profile
    },
    staleTime: 1000 * 60 * 5,
  })

  return {
    currentProfile: query.data,
    currentError: query.error,
    ...query,
  }
}

export const useUpdateProfile = (
  options?: UseMutationOptions<
    UpdateProfileMutation['updateProfile'],
    unknown,
    UpdateProfileMutationVariables
  >,
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

      const updated = result.data.updateProfile

      console.log('🟢 useUpdateProfile returned profile:', updated)

      return updated
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.current })

      if (variables?.input?.id) {
        queryClient.invalidateQueries({
          queryKey: profileKeys.byId(variables.input.id),
        })
      }

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
