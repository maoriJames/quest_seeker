import { Card } from '@aws-amplify/ui-react'
import { Link, useNavigate } from 'react-router-dom'
import { CardContent } from './ui/card'
import { Profile, Quest } from '@/types'
import { Button } from './ui/button'
import { useQuestList } from '@/hooks/userQuests'
import RemoteImage from './RemoteImage'
import placeHold from '@/assets/images/placeholder_view_vector.svg'
import { Trash2 } from 'lucide-react'
import { toZonedTime } from 'date-fns-tz'
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

  const now = new Date()

  const myCreatedQuests = allQuests.filter(
    (quest) => quest.creator_id === profile.id
  )
  // console.log('myCreatedQuests: ', myCreatedQuests)

  const normalizedQuests = (profile.my_quests ?? []).map((myQuest) => {
    const fullQuest = allQuests.find((q) => q.id === myQuest.quest_id)

    const questStatus = fullQuest?.status ?? 'draft'

    // const nzNow = toZonedTime(new Date(), 'Pacific/Auckland')
    const startDate = fullQuest?.quest_start
      ? toZonedTime(new Date(fullQuest.quest_start), 'Pacific/Auckland')
      : null
    console.log('Start date', startDate)
    const isUpcoming =
      questStatus === 'published' && startDate && startDate > now

    const isExpired = questStatus === 'expired'

    const totalTasks = myQuest.tasks?.length ?? 0
    const completedTasks = myQuest.tasks?.filter((t) => t.completed).length ?? 0

    const progressPercent =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    const isCompleted = progressPercent === 100

    return {
      ...myQuest,
      quest: fullQuest || null,
      questStatus,
      isUpcoming,
      expired: isExpired,
      completed: isCompleted,
      totalTasks,
      completedTasks,
      progressPercent,
    }
  })

  // console.log('normalizedQuests: ', normalizedQuests)
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
              <div className="flex items-start gap-3 w-full">
                <RemoteImage
                  path={myQuest.quest?.quest_image_thumb || placeHold}
                  fallback={placeHold}
                  className="w-14 h-14 object-contain rounded-full border border-gray-300 shadow-sm bg-white"
                />

                {/* Middle content */}
                <div className="flex flex-col flex-1 gap-1">
                  <span className="font-semibold text-gray-800">
                    {myQuest.title}
                  </span>

                  {/* 🔵 Progress bar (only if not completed) */}
                  {
                    <>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 bg-green-500 transition-all duration-300"
                          style={{ width: `${myQuest.progressPercent}%` }}
                        />
                      </div>

                      <span className="text-xs text-gray-500">
                        {myQuest.completedTasks} / {myQuest.totalTasks} tasks
                        completed
                      </span>
                    </>
                  }
                </div>

                <Button
                  variant="secondary"
                  className={`ml-auto pointer-events-none text-white ${
                    myQuest.expired
                      ? myQuest.completed
                        ? 'bg-red-600'
                        : 'bg-gray-500'
                      : myQuest.isUpcoming
                        ? 'bg-blue-500'
                        : 'bg-green-600'
                  }`}
                >
                  {myQuest.expired
                    ? myQuest.completed
                      ? 'Quest Ended'
                      : 'Incomplete'
                    : myQuest.isUpcoming
                      ? 'Upcoming'
                      : 'In Progress'}
                </Button>
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
                const startDate = quest.quest_start
                  ? toZonedTime(new Date(quest.quest_start), 'Pacific/Auckland')
                  : null
                //                   const startDate = fullQuest?.quest_start
                //   ? toZonedTime(new Date(fullQuest.quest_start), 'Pacific/Auckland')
                //   : null
                // console.log(
                //   'Start date for: ',
                //   quest.quest_name,
                //   ' is ',
                //   startDate
                // )

                const isUpcoming =
                  quest.status === 'published' && startDate && startDate > now

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
                        className={`ml-auto pointer-events-none px-3 py-1 rounded text-white ${
                          quest.status === 'expired'
                            ? 'bg-red-600'
                            : isUpcoming
                              ? 'bg-blue-500'
                              : quest.status === 'published'
                                ? 'bg-green-600'
                                : 'bg-gray-400'
                        }`}
                      >
                        {quest.status === 'expired'
                          ? 'Quest Ended'
                          : isUpcoming
                            ? 'Upcoming'
                            : quest.status === 'published'
                              ? 'In Progress'
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
                              // console.log('Delete quest:', quest.id)
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
