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

async function fetchAllProfilesByPoints(
  role: 'seeker' | 'creator'
): Promise<LeaderboardProfile[]> {
  const all: LeaderboardProfile[] = []
  let nextToken: string | null | undefined = undefined

  do {
    const res: ListResponse<LeaderboardProfile> =
      await client.models.Profile.listProfilesByPoints(
        { role },
        { sortDirection: 'DESC', nextToken }
      )

    all.push(...(res.data ?? []))
    nextToken = res.nextToken
  } while (nextToken)

  return all
}

export function useLeaderboardProfiles(
  role?: 'seeker' | 'creator',
  currentUserId?: string
): UseLeaderboardResult {
  const [topTen, setTopTen] = useState<LeaderboardProfile[]>([])
  const [userRank, setUserRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!role || !currentUserId) return

    const safeRole: 'seeker' | 'creator' = role
    const safeUserId = currentUserId

    let cancelled = false

    async function run() {
      setLoading(true)
      setError(null)

      try {
        // 1) Top 10
        const topRes = await client.models.Profile.listProfilesByPoints(
          { role: safeRole },
          { sortDirection: 'DESC', limit: 10 }
        )

        if (cancelled) return
        setTopTen(topRes.data ?? [])

        // 2) All for rank
        const allProfiles = await fetchAllProfilesByPoints(safeRole)

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
  }, [role, currentUserId])

  return { topTen, userRank, loading, error }
}
