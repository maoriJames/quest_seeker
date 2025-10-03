import { Link } from 'react-router-dom'
import { Quest } from '../types'
import { useS3Image } from '@/hooks/useS3Image'

type QuestListItemProps = {
  quest: Quest
}

export const defaultImage = '@/assets/images/placeholder_view_vector.svg'

export default function QuestListItem({ quest }: QuestListItemProps) {
  const questImageUrl = useS3Image(quest.quest_image)

  const reformatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-') // assuming YYYY-MM-DD
    return `${day}/${month}/${year}`
  }

  return (
    <Link to={`/quest/${quest.id}`} className="block">
      <div className="bg-white rounded-2xl p-4 shadow flex flex-col gap-2">
        <img
          src={questImageUrl || defaultImage}
          alt={quest.quest_name}
          className="w-full aspect-square rounded-2xl object-cover"
        />
        <h3 className="text-lg font-bold">{quest.quest_name}</h3>
        <p className="text-blue-500 font-bold">
          {reformatDate(quest.quest_start)}
        </p>
        <p className="text-sm">Region: {quest.region}</p>
      </div>
    </Link>
  )
}
