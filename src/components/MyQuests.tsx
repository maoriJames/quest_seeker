// import { useCurrentUserProfile } from '@/hooks/userProfiles'
import { Card } from '@aws-amplify/ui-react'
import { Link, useNavigate } from 'react-router-dom'
import { CardContent } from './ui/card'
import { MyQuest, Profile, Quest } from '@/types'
import { Button } from './ui/button'
import { useQuestList } from '@/hooks/userQuests'

type MyQuestsProps = {
  profile: Profile
  // allQuests: Quest[]
}

export default function MyQuests({ profile }: MyQuestsProps) {
  const { data: quests } = useQuestList()
  const allQuests: Quest[] = quests ?? []
  const navigate = useNavigate()

  const myCreatedQuests = allQuests.filter(
    (quest) => quest.creator_id === profile.id
  )

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

          <div className="p-4 max-w-xl mx-auto">
            <h2 className="font-semibold text-lg mb-2">
              Quests I Created (Just need to tidy this up)
            </h2>

            {myCreatedQuests.length === 0 ? (
              <p className="text-gray-500">
                You haven’t created any quests yet.
              </p>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {myCreatedQuests.map((quest) => (
                  <li key={quest.id}>
                    <Link
                      to={`/user/quest/${quest.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {quest.quest_name}
                    </Link>{' '}
                    ({quest.status ?? 'unknown'})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <Button variant="yellow" onClick={() => navigate('/user/region')}>
          Back to Home
        </Button>
      </CardContent>
    </Card>
  )
}
