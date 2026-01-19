import { generateClient } from 'aws-amplify/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listQuests, getQuest } from '@/graphql/queries'
import type {
  ListQuestsQuery,
  MutateQuestMutationVariables,
} from '@/graphql/API'
import { deleteQuest, mutateQuest } from '@/graphql/mutations'

const client = generateClient()

export const useQuestList = (region?: string) => {
  return useQuery({
    queryKey: ['quests', region],
    queryFn: async () => {
      let result

      try {
        result = await client.graphql<ListQuestsQuery>({
          query: listQuests,
          authMode: 'userPool',
        })
      } catch (err) {
        console.error('[useQuestList] graphql threw:', err)
        throw err
      }

      console.log('[useQuestList] raw result:', result)

      if ('errors' in result && result.errors?.length) {
        console.error('[useQuestList] GraphQL errors:', result.errors)
        throw new Error(result.errors[0].message)
      }

      if (!('data' in result)) {
        throw new Error('GraphQL result had no data')
      }

      const items = result.data?.listQuests?.items ?? []

      console.log('[useQuestList] items:', items)

      return items
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

export const useMutateQuest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: MutateQuestMutationVariables) => {
      const result = await client.graphql({
        query: mutateQuest,
        variables, // ✅ FLAT VARIABLES
        authMode: 'userPool',
      })

      if (!('data' in result) || !result.data?.mutateQuest) {
        throw new Error('mutateQuest failed')
      }

      return result.data.mutateQuest
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quests'] })

      if (data?.questId) {
        queryClient.invalidateQueries({
          queryKey: ['quest', data.questId],
        })
      }
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
