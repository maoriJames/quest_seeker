import { generateClient } from 'aws-amplify/api'
import { useQuery } from '@tanstack/react-query'
import { listQuests, getQuest } from '@/graphql/queries'
import type { ListQuestsQuery } from '@/graphql/API'

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

export const useQuest = (id: string) => {
  return useQuery({
    queryKey: ['quest', id],
    queryFn: async () => {
      const result = await client.graphql({
        query: getQuest,
        variables: { id },
        authMode: 'userPool', // 👈 ensures the logged-in user's token is sent
      })
      return result.data?.getQuest
    },
    enabled: !!id, // optional: only run if id is truthy
  })
}

// export const useSeekerQuests = (userId: string) => {
//   return useQuery({
//     queryKey: ['seeker-quests', userId],
//     queryFn: async () => {
//       // 1. Fetch the profile
//       const { data } = await client.graphql({
//         query: listProfiles,
//         variables: { filter: { id: { eq: userId } } },
//       })
//       const profile = data.listProfiles.items?.[0]
//       if (!profile) return []
//       const questIds =
//         (profile.my_quests as { questId: string }[] | undefined)?.map(
//           (q) => q.questId
//         ) ?? []
//       // 2. Fetch quests in parallel
//       const questResults = await Promise.all(
//         questIds.map((id) =>
//           client.graphql({
//             query: getQuest,
//             variables: { id },
//           })
//         )
//       )
//       return questResults.map((res) => res.data.getQuest).filter(Boolean)
//     },
//   })
// }

// export const useInsertQuest = () => {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: async (questInput: CreateQuestInput) => {
//       const { data } = await client.graphql({
//         query: createQuest,
//         variables: { input: questInput },
//       })
//       return data.createQuest
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['quests'] })
//     },
//   })
// }

// export const useUpdateQuest = () => {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: async (questInput: UpdateQuestInput) => {
//       const { data } = await client.graphql({
//         query: updateQuest,
//         variables: { input: questInput },
//       })
//       return data.updateQuest
//     },
//     onSuccess: (_, { id }) => {
//       queryClient.invalidateQueries({ queryKey: ['quests'] })
//       queryClient.invalidateQueries({ queryKey: ['quests', id] })
//     },
//   })
// }

// export const useDeleteQuest = () => {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: async (id: string) => {
//       await client.graphql({
//         query: deleteQuest,
//         variables: { input: { id } },
//       })
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['quests'] })
//     },
//   })
// }
