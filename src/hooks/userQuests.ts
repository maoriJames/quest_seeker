import { client } from '@/lib/amplifyClient'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listQuests, getQuest, listProfiles } from '@/graphql/queries'
import { createQuest, updateQuest, deleteQuest } from '@/graphql/mutations'
import type { CreateQuestInput, UpdateQuestInput } from '@/API'

export const useQuestList = (region?: string) => {
  return useQuery({
    queryKey: ['quests', region],
    queryFn: async () => {
      const { data } = await client.graphql({
        query: listQuests,
        variables:
          region && region !== 'Browse all'
            ? { filter: { region: { eq: region } } }
            : {},
      })
      return data.listQuests.items
    },
  })
}

export const useQuest = (id: string) => {
  return useQuery({
    queryKey: ['quests', id],
    queryFn: async () => {
      const { data } = await client.graphql({
        query: getQuest,
        variables: { id },
      })
      return data.getQuest
    },
  })
}

export const useSeekerQuests = (userId: string) => {
  return useQuery({
    queryKey: ['seeker-quests', userId],
    queryFn: async () => {
      // 1. Fetch the profile
      const { data } = await client.graphql({
        query: listProfiles,
        variables: { filter: { id: { eq: userId } } },
      })

      const profile = data.listProfiles.items?.[0]
      if (!profile) return []

      const questIds: string[] =
        profile.my_quests?.map((q: any) => q.questId) ?? []

      // 2. Fetch quests in parallel
      const questResults = await Promise.all(
        questIds.map((id) =>
          client.graphql({
            query: getQuest,
            variables: { id },
          })
        )
      )

      return questResults.map((res) => res.data.getQuest).filter(Boolean)
    },
  })
}

export const useInsertQuest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (questInput: CreateQuestInput) => {
      const { data } = await client.graphql({
        query: createQuest,
        variables: { input: questInput },
      })
      return data.createQuest
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
  })
}

export const useUpdateQuest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (questInput: UpdateQuestInput) => {
      const { data } = await client.graphql({
        query: updateQuest,
        variables: { input: questInput },
      })
      return data.updateQuest
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['quests'] })
      queryClient.invalidateQueries({ queryKey: ['quests', id] })
    },
  })
}

export const useDeleteQuest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await client.graphql({
        query: deleteQuest,
        variables: { input: { id } },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
  })
}
