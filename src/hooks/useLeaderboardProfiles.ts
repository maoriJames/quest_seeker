// hooks/useLeaderboardProfiles.ts
import { useEffect, useState } from 'react'

type LeaderboardProfile = {
  id: string
  display_name: string
  points: number
}

export function useLeaderboardProfiles() {
  const [profiles, setProfiles] = useState<LeaderboardProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: replace with real fetch
    setProfiles([
      { id: '1', display_name: 'Aroha', points: 1200 },
      { id: '2', display_name: 'Wiremu', points: 1100 },
      { id: '3', display_name: 'Hine', points: 980 },
      // ...
    ])
    setLoading(false)
  }, [])

  return { profiles, loading }
}
