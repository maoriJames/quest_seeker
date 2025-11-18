// import { useCurrentUserProfile } from '@/hooks/userProfiles'
import { Card } from '@aws-amplify/ui-react'
import { Link } from 'react-router-dom'
import { CardContent } from './ui/card'
import { Profile } from '@/types'

type MyQuest = {
  quest_id: string
  title: string
  completed: boolean
}
type MyQuestsProps = {
  profile: Profile
}

export default function MyQuests({ profile }: MyQuestsProps) {
  // const {
  //   currentProfile: profile,
  //   isLoading,
  //   currentError: error,
  // } = useCurrentUserProfile()

  // if (isLoading) return <p className="p-4 text-center">Loading...</p>
  // if (error || !profile)
  //   return <p className="p-4 text-center">Profile not found.</p>

  // const normalizedProfile = {
  //   ...profile,
  //   my_quests: (() => {
  //     if (!profile.my_quests) return [] as MyQuest[]
  //     if (Array.isArray(profile.my_quests)) return profile.my_quests
  //     try {
  //       return JSON.parse(profile.my_quests) as MyQuest[]
  //     } catch {
  //       console.warn('Failed to parse my_quests:', profile.my_quests)
  //       return [] as MyQuest[]
  //     }
  //   })(),
  // }

  const normalizedQuests = (() => {
    if (!profile.my_quests) return []
    if (Array.isArray(profile.my_quests)) return profile.my_quests
    try {
      return JSON.parse(profile.my_quests) as MyQuest[]
    } catch {
      console.warn('Failed to parse my_quests:', profile.my_quests)
      return []
    }
  })()

  return (
    <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
      <CardContent className="flex flex-col gap-4">
        <div className="p-4 max-w-xl mx-auto">
          <h2 className="font-semibold text-lg mb-2">My Quests</h2>
          {normalizedQuests.length === 0 ? (
            <p className="text-gray-500">You haven’t joined any quests yet.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {normalizedQuests.map((myQuest) => (
                <li key={myQuest.quest_id}>
                  <Link
                    to={`/user/quest/${myQuest.quest_id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {myQuest.title}
                  </Link>{' '}
                  ({myQuest.completed ? 'Completed' : 'In Progress'})
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
