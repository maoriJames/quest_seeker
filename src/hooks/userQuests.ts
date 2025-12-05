import { generateClient } from 'aws-amplify/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listQuests, getQuest } from '@/graphql/queries'
import type {
  CreateQuestInput,
  ListQuestsQuery,
  UpdateQuestInput,
} from '@/graphql/API'
import { createQuest, deleteQuest, updateQuest } from '@/graphql/mutations'

const client = generateClient()

export const useQuestList = (region?: string) => {
  return useQuery({
    queryKey: ['quests', region],
    queryFn: async () => {
      const result = await client.graphql<ListQuestsQuery>({
        query: listQuests,
        variables:
          region && region !== 'Browse all'
            ? { filter: { region: { eq: region } } }
            : {},
        authMode: 'userPool', // Corrected authMode
      })

      if ('data' in result) {
        return result.data?.listQuests?.items ?? []
      }

      throw new Error('No data returned from GraphQL query')
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useQuest = (id?: string | number) => {
  return useQuery({
    queryKey: ['quest', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('No quest ID provided')
      }

      const result = await client.graphql({
        query: getQuest,
        variables: { id: String(id) }, // GraphQL expects string for ID
        authMode: 'userPool',
      })

      return result.data?.getQuest
    },
    enabled: !!id,
  })
}

export const useInsertQuest = () => {
  const queryClient = useQueryClient()
  console.log('prize fire 1?')
  return useMutation({
    mutationFn: async (questInput: CreateQuestInput) => {
      const { data } = await client.graphql({
        query: createQuest,
        variables: { input: questInput },
        authMode: 'userPool',
      })
      return data.createQuest
    },
    onSuccess: () => {
      console.log('prize fire success?')
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
        authMode: 'userPool',
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
        authMode: 'userPool',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
  })
}
