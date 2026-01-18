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
