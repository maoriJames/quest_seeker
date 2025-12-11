// import { useCurrentUserProfile } from '@/hooks/userProfiles'
import { Card } from '@aws-amplify/ui-react'
import { Link, useNavigate } from 'react-router-dom'
import { CardContent } from './ui/card'
import { Profile, Quest } from '@/types'
import { Button } from './ui/button'
import { useQuestList } from '@/hooks/userQuests'
import RemoteImage from './RemoteImage'
import placeHold from '@/assets/images/placeholder_view_vector.svg'
import { CheckCircle, Trash2 } from 'lucide-react'

import { useQuestDeletion } from '@/hooks/useQuestDeletion'

type MyQuestsProps = {
  profile: Profile
  // allQuests: Quest[]
}

export default function MyQuests({ profile }: MyQuestsProps) {
  const { data: quests } = useQuestList()
  const allQuests: Quest[] = quests ?? []
  const { deleteQuest } = useQuestDeletion()
  const navigate = useNavigate()

  const myCreatedQuests = allQuests.filter(
    (quest) => quest.creator_id === profile.id
  )
  console.log('myCreatedQuests: ', myCreatedQuests)

  const normalizedQuests = (profile.my_quests ?? []).map((myQuest) => {
    const fullQuest = allQuests.find((q) => q.id === myQuest.quest_id)

    const endDate = fullQuest?.quest_end ? new Date(fullQuest.quest_end) : null
    const now = new Date()

    const isExpired = !!endDate && endDate < now && !myQuest.completed

    return {
      ...myQuest,
      quest: fullQuest || null,
      expired: isExpired,
    }
  })

  console.log('normalizedQuests: ', normalizedQuests)
  return (
    <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-8 max-w-md w-full">
      <CardContent className="flex flex-col gap-4">
        <div className="space-y-3">
          <h2 className="font-semibold text-lg mb-2">Joined Quests</h2>
          {normalizedQuests.map((myQuest) => (
            <Link
              to={`/user/quest/${myQuest.quest_id}`}
              className="text-blue-600 hover:underline font-medium"
              key={myQuest.quest_id}
            >
              <div className="flex items-center gap-3 w-full">
                <RemoteImage
                  path={myQuest.quest?.quest_image_thumb || placeHold}
                  fallback={placeHold}
                  className="w-14 h-14 object-contain rounded-full border border-gray-300 shadow-sm bg-white"
                />

                {/* Quest title */}
                <div className="flex flex-col">{myQuest.title}</div>

                {/* Status badge */}
                <Button
                  variant="secondary"
                  className={`ml-auto pointer-events-none text-white ${
                    myQuest.completed
                      ? 'bg-red-600'
                      : myQuest.expired
                        ? 'bg-gray-500'
                        : 'bg-green-600'
                  }`}
                >
                  {myQuest.completed
                    ? 'Completed'
                    : myQuest.expired
                      ? 'Unfinished'
                      : 'In Progress'}
                </Button>

                {/* 🔥 Red tick for completed quests */}
                {myQuest.completed && (
                  <CheckCircle className="w-6 h-6 text-red-600 ml-2" />
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold text-lg mb-2">Quests I've Created</h2>
          {myCreatedQuests.length === 0 ? (
            <p className="text-gray-500">You haven’t created any quests yet.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {myCreatedQuests.map((quest) => {
                // Pick status color classes
                const statusClasses =
                  quest.status === 'published'
                    ? 'bg-green-600 text-white'
                    : quest.status === 'expired'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-400 text-white' // draft or unknown

                return (
                  <Link
                    to={`/user/quest/${quest.id}`}
                    className="text-blue-600 hover:underline font-medium"
                    key={quest.id}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <RemoteImage
                        path={quest.quest_image_thumb || placeHold}
                        fallback={placeHold}
                        className="w-14 h-14 object-contain rounded-full border border-gray-300 shadow-sm bg-white"
                      />

                      {/* Left content */}
                      <div className="flex flex-col">
                        {quest.quest_name}
                        <span className="text-sm text-gray-500">
                          {quest.status ?? 'unknown'}
                        </span>
                      </div>

                      {/* Right-aligned status button */}
                      <Button
                        variant="secondary"
                        className={`ml-auto pointer-events-none px-3 py-1 rounded ${statusClasses}`}
                      >
                        {quest.status === 'published'
                          ? 'Published'
                          : quest.status === 'expired'
                            ? 'Expired'
                            : 'Draft'}
                      </Button>

                      {/* Decide when to show the bin */}
                      <div className="w-10 flex justify-center">
                        {(quest.status === 'draft' ||
                          ((quest.status === 'published' ||
                            quest.status === 'expired') &&
                            Number(quest.participants) === 0)) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              console.log('Delete quest:', quest.id)
                              deleteQuest(quest, { stayHere: true })
                            }}
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
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
