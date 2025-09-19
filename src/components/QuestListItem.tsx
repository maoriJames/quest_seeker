import { Link } from 'react-router-dom'
import { useProfile } from '@/hooks/userProfiles'
// import { useState } from 'react'

type Quest = {
  id: string
  quest_name: string
  quest_start: string
  quest_image?: string
  region?: string
  creator_id: string
}

type QuestListItemProps = {
  quest: Quest
}

export const defaultImage =
  'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/default.png'

const QuestListItem = ({ quest }: QuestListItemProps) => {
  // const [profiles, setProfiles] = useState<any>(null)
  const { data, error, isLoading } = useProfile(quest.creator_id)

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Failed to fetch profile</p>

  // const profile = data || {}

  const reformatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('/')
    return `${day}/${month}/${year}`
  }

  return (
    <Link to={`/home/${quest.id}`}>
      <div className="bg-white p-4 rounded-2xl flex-1 max-w-[50%] cursor-pointer">
        <img
          src={quest.quest_image || defaultImage}
          alt={quest.quest_name}
          className="w-full aspect-square rounded-2xl"
        />
        <p className="text-xl font-bold mt-2">{quest.quest_name}</p>
        <p className="text-indigo-500 font-bold">
          {reformatDate(quest.quest_start)}
        </p>
        <p className="text-sm">Region: {quest.region}</p>
        {/* <p className="text-sm">
          Organisation: {profile?.organization_name || 'N/A'}
        </p> */}
      </div>
    </Link>
  )
}

export default QuestListItem
