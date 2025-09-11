import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
  return useQuery({
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
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await client.graphql({
        query: updateProfile,
        variables: { input: data },
      })
      return result.data.updateProfile
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      queryClient.invalidateQueries({ queryKey: ['profiles', id] })
    },
  })
}

export const useUpdateSeeker = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await client.graphql({
        query: updateProfile,
        variables: { input: { id: data.id, my_quests: data.questId } },
      })
      return result.data.updateProfile
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      queryClient.invalidateQueries({ queryKey: ['profiles', id] })
    },
  })
}

export const useCountSeekers = (id: string) => {
  return useQuery({
    queryKey: ['profiles', 'count', id],
    queryFn: async () => {
      const result = await client.graphql({ query: listProfiles })
      const profiles = result.data.listProfiles.items

      // filter manually
      const count = profiles.filter((p: any) =>
        p.my_quests?.some((q: any) => q.questId === id)
      ).length

      return count
    },
  })
}
