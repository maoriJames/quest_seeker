import React, { useState } from 'react'
import { MyQuest, Profile, Quest } from '@/types'
import { useNavigate } from 'react-router-dom'
import placeHold from '@/assets/images/placeholder_view_vector.svg'
import RemoteImage from './RemoteImage'

interface QuestListItemProps {
  quest: Quest
  currentUserProfile?: Profile
}

const QuestListItem = React.memo(function QuestListItem({
  quest,
  currentUserProfile,
}: QuestListItemProps) {
  const navigate = useNavigate()
  const [loaded, setLoaded] = useState(false)

  const now = new Date()
  const startDate = new Date(quest.quest_start ?? '')
  const endDate = new Date(quest.quest_end ?? '')

  // Convert my_quests to an array safely
  const myQuestsArray: MyQuest[] = (() => {
    if (!currentUserProfile?.my_quests) return []
    if (typeof currentUserProfile.my_quests === 'string') {
      try {
        return JSON.parse(currentUserProfile.my_quests) as MyQuest[]
      } catch {
        return []
      }
    }
    return currentUserProfile.my_quests // already an array
  })()

  // Check if user has joined this quest
  const hasJoined = myQuestsArray.some((q) => q.quest_id === quest.id)

  const currentQuest = endDate < now
  if (currentQuest) return null

  const handleClick = () => {
    navigate(`/user/quest/${quest.id}`)
  }

  // Check if quest is upcoming within 3 days
  const threeDays = 3 * 24 * 60 * 60 * 1000
  const isUpcoming =
    startDate.getTime() - now.getTime() <= threeDays &&
    startDate.getTime() - now.getTime() > 0

  // Check if quest has started
  const isLive = now >= startDate && now <= endDate

  // Use a thumbnail or fallback to the full image
  const imageSrc = quest.quest_image_thumb || quest.quest_image || placeHold

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden border border-gray-100 relative"
    >
      <div className="relative w-full h-40 bg-gray-100">
        {!loaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-t-xl" />
        )}
        <RemoteImage
          path={imageSrc || quest.quest_image || ''}
          fallback={placeHold}
          className={`object-cover w-full h-40 transition-opacity duration-500 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setLoaded(true)}
        />
        {/* Upcoming badge */}
        {isUpcoming && (
          <span className="absolute bottom-2 right-2 bg-yellow-400 text-white text-xs font-semibold px-2 py-1 rounded">
            Upcoming
          </span>
        )}
        {/* Live badge */}
        {isLive && (
          <span className="absolute bottom-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
            In Progress
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-gray-800 truncate">
          {quest.quest_name}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {quest.region || 'Unknown region'}
        </p>
        <p className="text-xs text-gray-500">
          Ends: {quest.quest_end ? quest.quest_end.split('T')[0] : 'N/A'}
        </p>
        {hasJoined && (
          <span className="absolute top-2 right-2 text-green-500 text-lg">
            ✅
          </span>
        )}
      </div>
    </div>
  )
})

export default QuestListItem
