import { Link } from 'react-router-dom'
import { useProfile } from '@/hooks/userProfiles'
import { Quest } from '../types'

type QuestListItemProps = {
  quest: Quest
}

export const defaultImage = '@/assets/images/willow_cat.png'

export default function QuestListItem({ quest }: QuestListItemProps) {
  // const {
  //   data: profiles,
  //   error,
  //   isLoading,
  // } = useProfile(quest.creator_id as string, {
  //   enabled: !!quest.creator_id, // only runs if creator_id is truthy
  // })
  const {
    data: profiles,
    error,
    isLoading,
  } = useProfile(quest.creator_id as string, {
    enabled: !!quest.creator_id && quest.creator_id !== 'sandbox-user',
  })

  // Use a dummy profile if this is a sandbox quest
  const profileData =
    quest.creator_id === 'sandbox-user'
      ? { organization_name: 'Sandbox Org' }
      : profiles

  const reformatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-') // assuming YYYY-MM-DD
    return `${day}/${month}/${year}`
  }

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Failed to fetch profile.</p>

  return (
    <Link to={`/home/${quest.id}`} className="block">
      <div className="bg-white rounded-2xl p-4 shadow flex flex-col gap-2">
        <img
          src={quest.quest_image || defaultImage}
          alt={quest.quest_name}
          className="w-full aspect-square rounded-2xl object-cover"
        />
        <h3 className="text-lg font-bold">{quest.quest_name}</h3>
        <p className="text-blue-500 font-bold">
          {reformatDate(quest.quest_start)}
        </p>
        <p className="text-sm">Region: {quest.region}</p>
        <p className="text-sm">
          Organisation: {profileData?.organization_name || 'N/A'}
        </p>
      </div>
    </Link>
  )
}
