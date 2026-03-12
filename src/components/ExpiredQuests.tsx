import { Card } from '@aws-amplify/ui-react'
import { Link, useNavigate } from 'react-router-dom'
import { CardContent } from './ui/card'
import { Profile, Quest } from '@/types'
import { Button } from './ui/button'
import { useUserQuests, useQuestList } from '@/hooks/userQuests'

type ExpiredQuestsProps = {
  profile: Profile
}

export default function ExpiredQuests({ profile }: ExpiredQuestsProps) {
  const navigate = useNavigate()
  const { data: userQuests } = useUserQuests(profile.id)
  const { data: quests } = useQuestList()

  const expiredQuests = (userQuests ?? []).filter((uq) => {
    const fullQuest = quests?.find((q: Quest) => q.id === uq.questId)
    if (!fullQuest?.quest_end_at) return false
    return new Date(fullQuest.quest_end_at) < new Date()
  })

  return (
    <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
      <CardContent className="flex flex-col gap-4">
        <div className="p-4 max-w-xl mx-auto">
          <h2 className="font-semibold text-lg mb-2">Expired Quests</h2>
          {expiredQuests.length === 0 ? (
            <p className="text-gray-500">You have no expired quests.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {expiredQuests.map((uq) => {
                const fullQuest = quests?.find(
                  (q: Quest) => q.id === uq.questId,
                )
                const isCompleted = uq.status === 'COMPLETED'
                return (
                  <li key={uq.questId}>
                    <Link
                      to={`/user/quest/${uq.questId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {fullQuest?.quest_name ?? 'Untitled Quest'}
                    </Link>{' '}
                    ({isCompleted ? 'Completed' : 'In Progress'})
                  </li>
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
