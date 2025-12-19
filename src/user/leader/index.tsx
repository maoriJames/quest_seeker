import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import bg from '@/assets/images/background_main.png'
import { useCurrentUserProfile } from '@/hooks/userProfiles'
import { useLeaderboardProfiles } from '@/hooks/useLeaderboardProfiles'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function Leader() {
  const { currentProfile } = useCurrentUserProfile()

  const navigate = useNavigate()
  const role =
    currentProfile?.role === 'seeker' || currentProfile?.role === 'creator'
      ? currentProfile.role
      : undefined

  const { topTen, userRank, loading, error } = useLeaderboardProfiles(
    role,
    currentProfile?.id
  )

  const profilePoints = currentProfile?.points ?? 0

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl max-w-5xl w-full">
        <CardContent className="flex flex-col gap-6 p-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold">Leaderboard</h1>
            <p className="text-muted-foreground mt-1">
              Your current points total is{' '}
              <span className="font-semibold text-foreground">
                {profilePoints}
              </span>
            </p>
          </div>

          {/* Content */}
          {loading ? (
            <p className="text-center text-muted-foreground">Loading…</p>
          ) : error ? (
            <p className="text-center text-destructive">{error}</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {topTen.map((profile, index) => (
                    <TableRow
                      key={profile.id}
                      className={
                        profile.id === currentProfile?.id
                          ? 'bg-primary/10'
                          : undefined
                      }
                    >
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        {profile.full_name}
                        {profile.id === currentProfile?.id && (
                          <span className="ml-2 text-xs text-primary">
                            (You)
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {profile.points}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {userRank && userRank > 10 && (
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  You are currently ranked{' '}
                  <span className="font-semibold text-foreground">
                    #{userRank}
                  </span>
                </div>
              )}
              <Button variant="yellow" onClick={() => navigate(-1)}>
                Back to Quests
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
