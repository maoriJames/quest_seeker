import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteS3Object } from '@/tools/deleteS3Object'
import { useDeleteQuest } from '@/hooks/userQuests'
import { Quest } from '@/types'

interface UseDeleteQuestOptions {
  onSuccess?: () => void
  onError?: (err: unknown) => void
}

export function useQuestDeletion(options?: UseDeleteQuestOptions) {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const deleteQuestMutation = useDeleteQuest()

  const deleteQuest = async (quest: Quest, opts?: { stayHere?: boolean }) => {
    if (!quest) return
    if (!window.confirm('Are you sure you want to delete this quest?')) return

    setLoading(true)
    try {
      // Delete main quest image
      if (quest.quest_image) {
        await deleteS3Object(quest.quest_image)
      }

      // Delete sponsor images
      const sponsors = Array.isArray(quest.quest_sponsor)
        ? quest.quest_sponsor
        : JSON.parse(quest.quest_sponsor || '[]')
      for (const sponsor of sponsors) {
        if (sponsor.image) {
          await deleteS3Object(sponsor.image)
        }
      }

      // Delete prize images
      const prizes = Array.isArray(quest.quest_prize_info)
        ? quest.quest_prize_info
        : JSON.parse(quest.quest_prize_info || '[]')
      for (const prize of prizes) {
        if (prize.image) {
          await deleteS3Object(prize.image)
        }
      }

      // Delete quest record
      await deleteQuestMutation.mutateAsync(quest.id)

      window.alert('Quest and associated images deleted successfully!')
      options?.onSuccess?.()

      // 👇 Only navigate if the caller didn't request to stay on page
      if (!opts?.stayHere) {
        navigate(-1)
      }
    } catch (err) {
      console.error('Failed to delete quest:', err)
      window.alert('Failed to delete quest.')
      options?.onError?.(err)
    } finally {
      setLoading(false)
    }
  }

  return { deleteQuest, loading }
}
