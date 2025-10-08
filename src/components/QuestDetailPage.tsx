import { useParams, useNavigate } from 'react-router-dom'
import { useQuest } from '@/hooks/userQuests'
import { useProfile, useCurrentUserProfile } from '@/hooks/userProfiles'
import { remove } from '@aws-amplify/storage'
import { useDeleteQuest } from '@/hooks/userQuests'
import bg from '@/assets/images/background_main.png'
import { Card } from '@aws-amplify/ui-react'
import { CardContent } from './ui/card'
import { useS3Image } from '@/hooks/useS3Image'

export default function QuestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // 🧩 Fetch quest data
  const { data: quest, isLoading, error } = useQuest(id)
  const questCreatorProfile = useProfile(quest?.creator_id || '')
  const { data: currentUserProfile } = useCurrentUserProfile()

  const deleteQuestMutation = useDeleteQuest()
  const questImageUrl = useS3Image(quest?.quest_image ?? null)

  if (isLoading) return <p>Loading quest...</p>
  if (error) return <p>Failed to fetch quest.</p>
  if (!quest) return <p>Quest not found.</p>

  const deleteS3Object = async (path: string) => {
    if (!path) return
    try {
      let key = path
      try {
        const url = new URL(path)
        key = url.pathname.slice(1)
      } catch {
        // already a valid key
      }
      console.log('🗑️ Deleting S3 object:', key)
      await remove({ path: key })
    } catch (err) {
      console.error('Failed to delete S3 object:', err)
    }
  }

  const handleDelete = async () => {
    if (!quest) return
    if (!window.confirm('Are you sure you want to delete this quest?')) return

    try {
      // Delete quest image
      if (quest.quest_image) {
        await deleteS3Object(quest.quest_image)
      }

      // Delete all sponsor images
      if (Array.isArray(quest.quest_sponsor)) {
        for (const sponsor of quest.quest_sponsor) {
          if (sponsor.sponsorImage && sponsor.image) {
            await deleteS3Object(sponsor.image)
          }
        }
      }

      // Delete quest record
      await deleteQuestMutation.mutateAsync(quest.id)
      window.alert('Quest and associated images deleted successfully!')
      navigate(-1)
    } catch (err) {
      console.error('Failed to delete quest:', err)
      window.alert('Failed to delete quest.')
    }
  }

  // 🧭 Check if current user is creator of this quest
  const isOwner =
    currentUserProfile?.id === quest.creator_id &&
    currentUserProfile?.role === 'creator'

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
            Organisation:{' '}
            {questCreatorProfile?.data?.organization_name || 'N/A'}
          </p>
          <p className="text-sm text-gray-500 mb-1">
            Start: {quest.quest_start}
          </p>
          <p className="text-sm text-gray-500">End: {quest.quest_end}</p>

          {/* Conditional button rendering */}
          {isOwner ? (
            <button
              onClick={handleDelete}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Delete Quest
            </button>
          ) : currentUserProfile?.role === 'seeker' ? (
            <button
              onClick={() => navigate('/user/region')}
              className="mt-4 bg-[#facc15] hover:bg-[#ca8a04] text-white px-4 py-2 rounded"
            >
              Join the quest!
            </button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
