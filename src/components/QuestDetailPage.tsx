import { useParams } from 'react-router-dom'
import { useQuest } from '@/hooks/userQuests'
import { useProfile } from '@/hooks/userProfiles'

export default function QuestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: quest, isLoading, error } = useQuest(id)
  const { data: profile } = useProfile(quest?.creator_id || '')

  if (isLoading) return <p>Loading quest...</p>
  if (error) return <p>Failed to fetch quest.</p>
  if (!quest) return <p>Quest not found.</p>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{quest.quest_name}</h1>
      <img
        src={quest.quest_image ?? '/fallback-image.png'}
        alt={quest.quest_name ?? 'Untitled Quest'}
        className="w-full max-w-md rounded"
      />

      <p>{quest.quest_details}</p>
      <p>Region: {quest.region}</p>
      <p>Organisation: {profile?.organization_name || 'N/A'}</p>
      <p>Start: {quest.quest_start}</p>
      <p>End: {quest.quest_end}</p>
    </div>
  )
}
