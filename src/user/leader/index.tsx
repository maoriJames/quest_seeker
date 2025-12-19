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

export default function Leader() {
  const { currentProfile } = useCurrentUserProfile()
  const { profiles, loading } = useLeaderboardProfiles()

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

          {/* Table */}
          {loading ? (
            <p className="text-center text-muted-foreground">Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {profiles.slice(0, 10).map((profile, index) => (
                  <TableRow
                    key={profile.id}
                    className={
                      profile.id === currentProfile?.id
                        ? 'bg-primary/10'
                        : undefined
                    }
                  >
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{profile.display_name}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {profile.points}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
