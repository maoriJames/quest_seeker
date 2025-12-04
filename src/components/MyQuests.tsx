// import { useCurrentUserProfile } from '@/hooks/userProfiles'
import { Card } from '@aws-amplify/ui-react'
import { Link, useNavigate } from 'react-router-dom'
import { CardContent } from './ui/card'
import { Profile, Quest } from '@/types'
import { Button } from './ui/button'
import { useQuestList } from '@/hooks/userQuests'
import RemoteImage from './RemoteImage'
import placeHold from '@/assets/images/placeholder_view_vector.svg'

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
  console.log('myCreatedQuests: ', myCreatedQuests)

  const normalizedQuests = (profile.my_quests ?? []).map((myQuest) => {
    const fullQuest = allQuests.find((q) => q.id === myQuest.quest_id)

    return {
      ...myQuest,
      quest: fullQuest || null,
    }
  })

  return (
    <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-8 max-w-md w-full">
      <CardContent className="flex flex-col gap-4">
        <div className="space-y-3">
          <h2 className="font-semibold text-lg mb-2">Joined Quests</h2>
          {normalizedQuests.length === 0 ? (
            <p className="text-gray-500">You haven’t joined any quests yet.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {normalizedQuests.map((myQuest) => (
                <div key={myQuest.quest_id} className="flex items-center gap-3">
                  <RemoteImage
                    path={myQuest.quest?.quest_image_thumb || placeHold}
                    fallback={placeHold}
                    className="w-14 h-14 object-contain rounded-full border border-gray-300 shadow-sm bg-white"
                  />

                  <div className="flex flex-col">
                    <Link
                      to={`/user/quest/${myQuest.quest_id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {myQuest.title}
                    </Link>

                    <span className="text-sm text-gray-500">
                      {myQuest.completed ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                </div>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold text-lg mb-2">Quests I've Created</h2>
          {myCreatedQuests.length === 0 ? (
            <p className="text-gray-500">You haven’t created any quests yet.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {myCreatedQuests.map((quest) => (
                <div key={quest.id} className="flex items-center gap-3">
                  <RemoteImage
                    path={quest.quest_image_thumb || placeHold}
                    fallback={placeHold}
                    className="w-14 h-14 object-contain rounded-full border border-gray-300 shadow-sm bg-white"
                  />
                  <div className="flex flex-col">
                    <Link
                      to={`/user/quest/${quest.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {quest.quest_name}
                    </Link>
                    <span className="text-sm text-gray-500">
                      {quest.status ?? 'unknown'}
                    </span>
                  </div>
                </div>
              ))}
            </ul>
          )}
        </div>

        <Button variant="yellow" onClick={() => navigate('/user/region')}>
          Back to Home
        </Button>
      </CardContent>
    </Card>
  )
}
