// hooks/useLeaderboard.ts
import { useEffect, useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'

const client = generateClient<Schema>()

type LeaderboardProfile = Schema['Profile']['type']

type UseLeaderboardResult = {
  topTen: LeaderboardProfile[]
  userRank: number | null
  loading: boolean
  error: string | null
}

type ListResponse<T> = {
  data?: T[]
  nextToken?: string | null
}

/**
 * Fetch all profiles ordered by points DESC
 * (used only to compute the current user's rank)
 */
async function fetchAllProfilesByPoints(): Promise<LeaderboardProfile[]> {
  const all: LeaderboardProfile[] = []
  let nextToken: string | null | undefined = undefined

  do {
    const res: ListResponse<LeaderboardProfile> =
      await client.models.Profile.listProfilesByPoints(
        {},
        { sortDirection: 'DESC', nextToken }
      )

    all.push(...(res.data ?? []))
    nextToken = res.nextToken
  } while (nextToken)

  return all
}

export function useLeaderboardProfiles(
  currentUserId?: string
): UseLeaderboardResult {
  const [topTen, setTopTen] = useState<LeaderboardProfile[]>([])
  const [userRank, setUserRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentUserId) return

    const safeUserId = currentUserId
    let cancelled = false

    async function run() {
      setLoading(true)
      setError(null)

      try {
        // 1) Global top 10
        const topRes = await client.models.Profile.listProfilesByPoints(
          {},
          { sortDirection: 'DESC', limit: 10 }
        )

        if (cancelled) return
        setTopTen(topRes.data ?? [])

        // 2) Compute global rank
        const allProfiles = await fetchAllProfilesByPoints()

        if (cancelled) return
        const rankIndex = allProfiles.findIndex((p) => p.id === safeUserId)

        setUserRank(rankIndex >= 0 ? rankIndex + 1 : null)
      } catch (e) {
        console.error(e)
        if (!cancelled) setError('Failed to load leaderboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [currentUserId])

  return { topTen, userRank, loading, error }
}
