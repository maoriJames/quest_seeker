import React, { useState } from 'react'
import { Quest } from '@/types'
import { useNavigate } from 'react-router-dom'
import placeHold from '@/assets/images/placeholder_view_vector.svg'
import RemoteImage from './RemoteImage'

interface QuestListItemProps {
  quest: Quest
}

const QuestListItem = React.memo(function QuestListItem({
  quest,
}: QuestListItemProps) {
  const navigate = useNavigate()
  const [loaded, setLoaded] = useState(false)

  const handleClick = () => {
    navigate(`/user/quest/${quest.id}`)
  }

  // Use a thumbnail or fallback to the full image
  const imageSrc = quest.quest_image_thumb || quest.quest_image || placeHold
  return (
    <div
      onClick={handleClick}
      className="cursor-pointer bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden border border-gray-100"
    >
      <div className="relative w-full h-40 bg-gray-100">
        {!loaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-t-xl" />
        )}
        <RemoteImage
          path={imageSrc || quest.quest_image || ''}
          fallback={placeHold}
          className={`object-cover w-full h-40 transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
        />
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
      </div>
    </div>
  )
})

export default QuestListItem
