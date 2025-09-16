import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  UpdateProfileMutation,
  UpdateProfileMutationVariables,
  ListProfilesQuery,
} from '@/graphql/API'
import { generateClient } from 'aws-amplify/api'
import { listProfiles } from '@/graphql/queries'
import { updateProfile } from '@/graphql/mutations'
import { getCurrentUser } from 'aws-amplify/auth'

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

export const useProfile = (id: string) => {
  return useQuery({
    queryKey: ['profiles', id],
    queryFn: async () => {
      const result = await client.graphql({
        query: getProfile,
        variables: { id },
      })
      return result.data.getProfile
    },
  })
}

export const useCurrentUserProfile = () => {
  const query = useQuery({
    queryKey: ['currentProfile'],
    queryFn: async () => {
      const { userId } = await getCurrentUser()

      const result = await client.graphql({
        query: getProfile,
        variables: { id: userId },
      })

      return result.data.getProfile
    },
  })

  return {
    currentProfile: query.data, // 👈 alias
    error: query.error,
    isLoading: query.isLoading,
    ...query, // keep the rest (isError, refetch, etc.)
  }
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: UpdateProfileMutationVariables) => {
      const result = (await client.graphql<UpdateProfileMutation>({
        query: updateProfile,
        variables,
      })) as { data: UpdateProfileMutation } // 👈 force-narrow to query/mutation shape

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
