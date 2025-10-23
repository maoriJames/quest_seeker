import { Link } from 'react-router-dom'
import { Quest } from '../types'
// import { useS3Image } from '@/hooks/useS3Image'
// import { useState } from 'react'
import RemoteImage from './RemoteImage'
import placeHold from '@/assets/images/placeholder_view_vector.svg'

type QuestListItemProps = {
  quest: Quest
}

export const defaultImage = '@/assets/images/placeholder_view_vector.svg'

export default function QuestListItem({ quest }: QuestListItemProps) {
  // const [questImage, setQuestImage] = useState(quest.quest_image || '')
  // const questImageUrl = useS3Image(quest.quest_image)

  const reformatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-') // assuming YYYY-MM-DD
    return `${day}/${month}/${year}`
  }

  return (
    <Link to={`/user/quest/${quest.id}`} className="block">
      <div className="bg-white rounded-2xl p-4 shadow flex flex-col items-center gap-2">
        {/* Centered circular image */}
        <RemoteImage
          path={quest.quest_image || placeHold}
          fallback={placeHold}
          className="w-32 h-32 rounded-full object-cover mx-auto"
        />

        {/* Quest name with single-line ellipsis */}
        <h3 className="text-lg font-bold text-center truncate w-full">
          {quest.quest_name}
        </h3>

        {/* Start date */}
        <p className="text-blue-500 font-bold text-center">
          {reformatDate(quest.quest_start)}
        </p>

        {/* Region with single-line ellipsis if too long */}
        <p className="text-sm text-center truncate w-full">
          Region: {quest.region}
        </p>
      </div>
    </Link>
  )
}
