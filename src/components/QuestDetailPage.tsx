import { useParams, useNavigate } from 'react-router-dom'
import { useQuest } from '@/hooks/userQuests'
import { useProfile } from '@/hooks/userProfiles'
import { remove } from '@aws-amplify/storage'
import { useDeleteQuest } from '@/hooks/userQuests'
import bg from '@/assets/images/background_main.png'
import { Card } from '@aws-amplify/ui-react'
import { CardContent } from './ui/card'
import { useS3Image } from '@/hooks/useS3Image'

export default function QuestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: quest, isLoading, error } = useQuest(id)
  const { data: profile } = useProfile(quest?.creator_id || '')

  const deleteQuestMutation = useDeleteQuest()
  const questImageUrl = useS3Image(quest?.quest_image ?? null)
  if (isLoading) return <p>Loading quest...</p>
  if (error) return <p>Failed to fetch quest.</p>
  if (!quest) return <p>Quest not found.</p>

  const handleDelete = async () => {
    if (!quest) return

    if (!window.confirm('Are you sure you want to delete this quest?')) return

    try {
      // Delete the quest from your backend
      await deleteQuestMutation.mutateAsync(quest.id)

      // Delete the quest image from S3 if it exists
      if (quest.quest_image) {
        try {
          let key = quest.quest_image

          // If it's a full URL, extract the pathname and keep the 'public/' prefix
          try {
            const url = new URL(quest.quest_image)
            key = url.pathname.slice(1) // removes leading '/', keeps 'public/...' intact
          } catch {
            // If it's already a key, leave it as-is
          }

          console.log('Deleting S3 object with key:', key)
          console.log('path.key: ', { path: key })
          await remove({ path: key })
          console.log('Quest image deleted from S3:', key)
        } catch (err) {
          console.error('Failed to delete S3 image:', err)
        }
      }

      window.alert('Quest deleted successfully!')
      navigate(-1)
    } catch (err) {
      console.error('Failed to delete quest:', err)
    }
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <Card className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl max-w-2xl w-full flex overflow-hidden">
        <img
          src={questImageUrl ?? '/fallback-image.png'}
          alt={quest.quest_name ?? 'Untitled Quest'}
          className="w-1/3 h-auto object-cover"
        />
        <CardContent className="p-6 flex-1 text-left">
          <h1 className="text-2xl font-bold mb-2">{quest.quest_name}</h1>
          <p className="text-gray-700 mb-2">{quest.quest_details}</p>
          <p className="text-sm text-gray-500 mb-1">Region: {quest.region}</p>
          <p className="text-sm text-gray-500 mb-1">
            Organisation: {profile?.organization_name || 'N/A'}
          </p>
          <p className="text-sm text-gray-500 mb-1">
            Start: {quest.quest_start}
          </p>
          <p className="text-sm text-gray-500">End: {quest.quest_end}</p>
          <button onClick={handleDelete} className="btn btn-red">
            Delete Quest
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
