import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@radix-ui/react-tooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useCurrentUserProfile } from '@/hooks/userProfiles'
import { useUpdateProfile } from '@/hooks/userProfiles'
import { ProfileRole } from '@/graphql/API'

type AddQuestButtonProps = {
  to: string
}

export default function AddQuestButton({ to }: AddQuestButtonProps) {
  const navigate = useNavigate()
  const { currentProfile } = useCurrentUserProfile()
  const updateProfile = useUpdateProfile()
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Treat missing role as "seeker" by default
  const role = currentProfile?.role ?? ProfileRole.seeker

  const handleClick = () => {
    if (role === ProfileRole.creator) {
      navigate(to)
    } else {
      setModalOpen(true)
    }
  }

  const handleBecomeCreator = async () => {
    if (!currentProfile) return
    setLoading(true)
    try {
      await updateProfile.mutateAsync({
        input: {
          id: currentProfile.id,
          role: ProfileRole.creator,
        },
      })
      setModalOpen(false)
      navigate(to)
    } catch (err) {
      console.error('Failed to become creator:', err)
      alert('Something went wrong — please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ml-auto">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="flex items-center justify-center h-auto w-auto p-0 bg-transparent hover:bg-transparent"
              onClick={handleClick}
            >
              <Plus className="h-4 w-4 text-black" />
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg"
          >
            Create a quest
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Modal for becoming a creator */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Become a Creator</DialogTitle>
            <DialogDescription>
              You need to be a creator to publish quests. Would you like to
              upgrade your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBecomeCreator} disabled={loading}>
              {loading ? 'Updating...' : 'Become a Creator'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
