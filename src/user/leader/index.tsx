import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import bg from '@/assets/images/background_main.png'
import { useCurrentUserProfile } from '@/hooks/userProfiles'
import { useLeaderboardProfiles } from '@/hooks/useLeaderboardProfiles'
import { Button } from '@/components/ui/button'
import { useLocation, useNavigate } from 'react-router-dom'
import { Toolbar } from '@/components/Toolbar'
import SignOutButton from '@/components/SignOutButton'
import { Home } from 'lucide-react'
import { useEffect, useState } from 'react'
import RemoteImage from '@/components/RemoteImage'
import placeHold from '@/assets/images/placeholder_view_vector.svg'
import { Profile } from '@/types'

export default function Leader() {
  const { currentProfile } = useCurrentUserProfile()
  const location = useLocation()
  const navigate = useNavigate()

  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [activeTab, setActiveTab] = useState(
    location.state?.defaultTab || 'leader',
  )

  useEffect(() => {
    if (location.state?.defaultTab) {
      setActiveTab(location.state.defaultTab)
    }
  }, [location.state])

  const { topTen, userRank, loading, error } = useLeaderboardProfiles(
    currentProfile?.id,
  )

  const profilePoints = currentProfile?.points ?? 0

  return (
    <div
      className="relative h-screen flex items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl max-w-5xl w-full h-full max-h-full flex flex-col overflow-hidden">
        <CardContent className="flex flex-col gap-4 flex-1 min-h-0 p-0">
          <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-md p-4 shadow-sm border-b">
            <Toolbar>
              <Button
                variant="yellow"
                onClick={() => navigate('/user/region')}
                size="icon"
                aria-label="Home"
              >
                <Home />
              </Button>

              <Button
                variant="yellow"
                onClick={() => navigate('/user/account')}
              >
                My Account
              </Button>

              <Button
                variant="yellow"
                onClick={() =>
                  navigate('/user/account', {
                    state: { defaultTab: 'my-quests' },
                  })
                }
              >
                My Quests
              </Button>

              <Button
                variant={activeTab === 'leader' ? 'default' : 'yellow'}
                onClick={() => navigate('/user/leader')}
              >
                Leader Board
              </Button>

              <Button variant="yellow" onClick={() => navigate('/user/help')}>
                Help
              </Button>
              <SignOutButton />
            </Toolbar>
          </div>
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

          {/* Points Key */}
          <div className="flex justify-center gap-6 text-sm text-muted-foreground bg-white/50 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-yellow-500 font-bold text-base">
                Join a Quest = 10 Points
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500 font-bold text-base">
                Complete a Quest Task = 1 Point
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            <div className="w-full max-w-3xl mx-auto">
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
                      {(topTen as Profile[]).map((profile, index) => (
                        <TableRow
                          key={profile.id}
                          className={
                            profile.id === currentProfile?.id
                              ? 'bg-primary/10'
                              : undefined
                          }
                          onClick={() => setSelectedProfile(profile)}
                        >
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>
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
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Profile Detail Modal */}
      <Dialog
        open={!!selectedProfile}
        onOpenChange={() => setSelectedProfile(null)}
      >
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>

          {selectedProfile && (
            <div className="flex flex-col items-center gap-4 py-4">
              <RemoteImage
                path={selectedProfile.image_thumbnail || placeHold}
                fallback={placeHold}
                className="w-32 h-32 rounded-full object-cover border-4 border-yellow-500"
              />
              <div className="text-center">
                <h2 className="text-2xl font-bold">
                  {selectedProfile.full_name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedProfile.role}
                </p>
              </div>

              <div className="w-full bg-muted/30 p-4 rounded-xl space-y-2">
                <p className="text-sm">
                  <strong>About:</strong>{' '}
                  {selectedProfile.about_me || 'No bio provided.'}
                </p>
                <p className="text-sm">
                  <strong>Total Points:</strong> {selectedProfile.points}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
