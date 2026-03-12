import { generateClient } from 'aws-amplify/api'
import { generateClient as generateDataClient } from 'aws-amplify/data'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listQuests, getQuest } from '@/graphql/queries'
import type {
  ListQuestsQuery,
  MutateQuestMutationVariables,
} from '@/graphql/API'
import { deleteQuest, mutateQuest } from '@/graphql/mutations'
import { Schema } from 'amplify/data/resource'

const client = generateClient()
const dataClient = generateDataClient<Schema>()

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

      // console.log('[useQuestList] raw result:', result)

      if ('errors' in result && result.errors?.length) {
        console.error('[useQuestList] GraphQL errors:', result.errors)
        throw new Error(result.errors[0].message)
      }

      if (!('data' in result)) {
        throw new Error('GraphQL result had no data')
      }

      const items = result.data?.listQuests?.items ?? []

      // console.log('[useQuestList] items:', items)

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

export const useUserQuests = (profileId?: string) => {
  return useQuery({
    queryKey: ['userQuests', profileId],
    queryFn: async () => {
      if (!profileId) throw new Error('No profileId provided')

      const { data, errors } = await dataClient.models.UserQuest.list({
        filter: { profileId: { eq: profileId } },
      })

      if (errors?.length) throw new Error(errors[0].message)

      return data.map((uq) => ({
        ...uq,
        tasks: (() => {
          try {
            return typeof uq.tasks === 'string'
              ? JSON.parse(uq.tasks)
              : (uq.tasks ?? [])
          } catch {
            return []
          }
        })(),
      }))
    },
    enabled: !!profileId,
    staleTime: 1000 * 60 * 2,
  })
}
