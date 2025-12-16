import { Card, CardContent } from '@/components/ui/card'
import bg from '@/assets/images/background_main.png'
// import type { Profile } from '@/types'
import { useCurrentUserProfile } from '@/hooks/userProfiles'

export default function Leader() {
  const { currentProfile } = useCurrentUserProfile()
  const profilePoints = currentProfile?.points
  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl max-w-5xl w-full flex flex-col">
        <CardContent className="flex flex-col gap-4">
          <div>Leader Board</div>
          <p>Your current points total is {profilePoints}</p>
        </CardContent>
      </Card>
    </div>
  )
}
