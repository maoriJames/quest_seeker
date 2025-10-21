import { generateClient } from 'aws-amplify/data'
import * as mutations from '@/graphql/mutations'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuest } from '@/hooks/userQuests'
import { useProfile, useCurrentUserProfile } from '@/hooks/userProfiles'
import { remove } from '@aws-amplify/storage'
import { useDeleteQuest } from '@/hooks/userQuests'
import bg from '@/assets/images/background_main.png'
import { Button, Card, VisuallyHidden } from '@aws-amplify/ui-react'
import { CardContent } from './ui/card'
import { useEffect, useState } from 'react'
import { Prize, MyQuest, Sponsor, Task } from '@/types'
import { addQuestToProfile } from '@/hooks/addQuestToProfile'
import RemoteImage from './RemoteImage'
import placeHold from '@/assets/images/placeholder_view_vector.svg'
import HomeButton from './HomeButton'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '@radix-ui/react-dialog'
import TaskInformationWindow from './TaskInformationWindow'
import { Pencil } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@radix-ui/react-tooltip'
import PickRegion from './PickRegion'
import { Calendar } from './ui/calendar'
import TaskCreatorButton from './TaskCreatorButton'

export default function QuestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [joining, setJoining] = useState(false)

  const navigate = useNavigate()

  // 🧩 Fetch quest data
  const { data: quest, isLoading, error, refetch } = useQuest(id)
  const questCreatorProfile = useProfile(quest?.creator_id || '')
  const { data: currentUserProfile } = useCurrentUserProfile()
  const [editName, setEditName] = useState(quest?.quest_name || '')
  const [editDetails, setEditDetails] = useState(quest?.quest_details || '')
  const [openStart, setOpenStart] = useState(false)
  const [openEnd, setOpenEnd] = useState(false)
  const [editStart, setEditStart] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [editEnd, setEditEnd] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [selectedRegion, setSelectedRegion] = useState('')
  const [open, setOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])

  const deleteQuestMutation = useDeleteQuest()

  // Keep them in sync when quest loads
  useEffect(() => {
    if (quest) {
      setEditName(quest.quest_name || '')
      setEditDetails(quest.quest_details || '')
      setEditStart(quest.quest_start || '')
      setEditEnd(quest.quest_end || '')
      setSelectedRegion(quest.region ?? '')

      // Initialize tasks
      const parsedTasks: Task[] = (() => {
        try {
          if (!quest.quest_tasks) return []
          return Array.isArray(quest.quest_tasks)
            ? quest.quest_tasks
            : JSON.parse(quest.quest_tasks)
        } catch {
          return []
        }
      })()
      setTasks(parsedTasks)
    }
  }, [quest])

  const client = generateClient()

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
      console.log('quest image:', quest.quest_image)
      if (quest.quest_image) {
        await deleteS3Object(quest.quest_image)
      }
      // Delete all sponsor images
      const sponsors = Array.isArray(quest.quest_sponsor)
        ? quest.quest_sponsor
        : JSON.parse(quest.quest_sponsor || '[]')
      for (const sponsor of sponsors) {
        if (sponsor.sponsorImage && sponsor.image) {
          await deleteS3Object(sponsor.image)
        }
      }

      // Delete all sponsor images
      const prizes = Array.isArray(quest.quest_prize_info)
        ? quest.quest_prize_info
        : JSON.parse(quest.quest_prize_info || '[]')
      for (const prize of prizes) {
        if (prize.prizeImage && prize.image) {
          await deleteS3Object(prize.image)
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

  const handleJoinQuest = async () => {
    if (!quest?.id || !quest?.quest_tasks) return

    setJoining(true)

    try {
      const tasks: Task[] = Array.isArray(quest.quest_tasks)
        ? (quest.quest_tasks as Task[])
        : []

      const userQuestEntry: MyQuest = {
        quest_id: quest.id,
        title: quest.quest_name ?? 'Untitled Quest',
        tasks,
        progress: 0,
        completed: false,
      }

      await addQuestToProfile(quest.id, [userQuestEntry])
      alert('✅ Quest added to your profile!')
    } catch (err) {
      console.error(err)
      alert('❌ Failed to join quest.')
    } finally {
      setJoining(false)
    }
  }

  const handleEditSubmit = async () => {
    try {
      const input = {
        id: quest.id,
        quest_name: editName,
        quest_details: editDetails,
        quest_start: editStart,
        quest_end: editEnd,
        quest_tasks: JSON.stringify(tasks),
        region: selectedRegion,
      }
      console.log('input: ', input)

      const result = await client.graphql({
        query: mutations.updateQuest,
        variables: { input },
        authMode: 'userPool',
      })

      // Update tasks immediately
      setTasks(JSON.parse(input.quest_tasks))

      console.log('✅ Quest updated:', result.data.updateQuest)
      await refetch()
      alert('Quest updated successfully!')
      setOpen(false)
    } catch (err) {
      console.error('❌ Failed to update quest:', err)
      alert('Failed to update quest.')
    }
  }

  const handleTasksUpdate = (updatedTasks: Task[]) => {
    setTasks(updatedTasks)
  }

  const isOwner =
    currentUserProfile?.id === quest.creator_id &&
    currentUserProfile?.role === 'creator'

  const myQuestsArray: MyQuest[] =
    typeof currentUserProfile?.my_quests === 'string'
      ? JSON.parse(currentUserProfile.my_quests)
      : (currentUserProfile?.my_quests ?? [])

  const hasJoined = myQuestsArray.some((q) => q.quest_id === quest.id)

  // Parse sponsors (safe check in case it's undefined or malformed)
  const sponsors: Sponsor[] = (() => {
    try {
      return quest.quest_sponsor ? JSON.parse(quest.quest_sponsor) : []
    } catch {
      return []
    }
  })()

  // Parse prizes (safe check in case it's undefined or malformed)
  const prizes: Prize[] = (() => {
    try {
      return quest.quest_prize_info ? JSON.parse(quest.quest_prize_info) : []
    } catch {
      return []
    }
  })()

  // Parse quest tasks (safe check in case it's undefined or malformed)
  const questTasks: Task[] = (() => {
    try {
      if (!quest.quest_tasks) return []
      return Array.isArray(quest.quest_tasks)
        ? quest.quest_tasks
        : JSON.parse(quest.quest_tasks)
    } catch {
      console.warn('⚠️ Could not parse quest_tasks:', quest.quest_tasks)
      return []
    }
  })()
  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <Card className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl max-w-2xl w-full flex overflow-hidden">
        <CardContent className="p-6 flex-1 text-left">
          {/* Top row: Quest image + optional sponsor */}
          <div className="flex items-start justify-between mb-4 w-full">
            {/* Quest image */}
            <RemoteImage
              path={quest.quest_image || placeHold}
              fallback={placeHold}
              className="w-1/3 h-auto object-cover rounded-lg"
            />
            {/* Sponsors (if any) */}
            {sponsors.length > 0 && (
              <div className="flex flex-col items-center gap-2 mb-4">
                <span className="text-xs text-gray-500 mb-1">
                  This quest is brought to you by:
                </span>

                <div className="flex gap-4">
                  {sponsors.map((sponsor) => (
                    <div
                      key={sponsor.id}
                      className="flex flex-col items-center w-20 text-center"
                    >
                      <RemoteImage
                        path={sponsor.image || placeHold}
                        fallback={placeHold}
                        className="w-16 h-16 object-cover rounded-full"
                      />
                      <span className="text-xs mt-1 font-semibold text-gray-700">
                        {sponsor.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quest details + Task list side by side */}
          <div className="flex flex-col md:flex-row gap-6 mt-2">
            {/* Left: Quest details */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{quest.quest_name}</h1>
              <p className="text-gray-700 mb-2">{quest.quest_details}</p>
              <p className="text-sm text-gray-500 mb-1">
                Region: {quest.region}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                Organisation:{' '}
                {questCreatorProfile?.data?.organization_name || 'N/A'}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                Start: {quest.quest_start}
              </p>
              <p className="text-sm text-gray-500">End: {quest.quest_end}</p>
              <p className="text-sm text-gray-500">
                Entry: {quest.quest_entry}
              </p>
            </div>

            {/* Right: Scrollable task list */}
            {currentUserProfile?.role === 'seeker' && hasJoined && (
              <TaskInformationWindow questId={quest.id} tasks={questTasks} />
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="mt-4 flex items-center justify-between w-full">
            {/* Delete Button Left */}
            <div>
              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Delete Quest
                </button>
              )}

              {!isOwner &&
                currentUserProfile?.role === 'seeker' &&
                (hasJoined ? (
                  <p className="text-green-600 font-semibold">
                    ✅ You have joined this quest!
                  </p>
                ) : (
                  <button
                    onClick={handleJoinQuest}
                    disabled={joining}
                    className={`px-4 py-2 rounded text-white ${
                      joining
                        ? 'bg-yellow-300'
                        : 'bg-[#facc15] hover:bg-[#ca8a04]'
                    }`}
                  >
                    {joining ? 'Joining...' : 'Join the quest!'}
                  </button>
                ))}
            </div>

            {/* Center: Home button */}
            <div className="flex justify-center flex-1">
              <HomeButton />
            </div>
            {/* Prize Information button inline */}
            <div>
              {prizes.length > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                      Prize Information
                    </button>
                  </DialogTrigger>

                  <DialogOverlay className="fixed inset-0 bg-black/30 z-40" />

                  <DialogContent className="fixed top-1/2 left-1/2 z-50 max-w-md w-full bg-white rounded-xl p-6 shadow-lg -translate-x-1/2 -translate-y-1/2">
                    <DialogTitle className="text-lg font-bold mb-4">
                      Prize Information
                    </DialogTitle>

                    <div className="flex flex-wrap justify-center gap-4">
                      {prizes.map((prize) => (
                        <div
                          key={prize.id}
                          className="flex flex-col items-center w-20 text-center"
                        >
                          <RemoteImage
                            path={prize.image || placeHold}
                            fallback={placeHold}
                            className="w-16 h-16 object-cover rounded-full"
                          />
                          <span className="text-xs mt-1 font-semibold text-gray-700">
                            {prize.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    <DialogClose asChild>
                      <button className="mt-4 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">
                        Close
                      </button>
                    </DialogClose>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardContent>
        {/* Edit button positioned relative to card */}
        {isOwner && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setOpen(true)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-gray-200 hover:bg-gray-300 shadow z-20"
                >
                  <Pencil className="w-5 h-5 text-gray-700" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Edit this quest</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </Card>

      {isOwner && (
        <Dialog open={open} onOpenChange={setOpen}>
          {/* <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setOpen(true)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-gray-200 hover:bg-gray-300 shadow"
                >
                  <Pencil className="w-5 h-5 text-gray-700" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Edit this quest</TooltipContent>
            </Tooltip>
          </TooltipProvider> */}

          {/* ✏️ Modal content */}
          <DialogOverlay className="fixed inset-0 bg-black/40 z-40" />
          <DialogContent className="fixed top-1/2 left-1/2 z-50 max-w-lg w-full bg-white rounded-xl p-6 shadow-lg -translate-x-1/2 -translate-y-1/2">
            <DialogTitle className="text-xl font-bold mb-4">
              Edit Quest
            </DialogTitle>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleEditSubmit()
              }}
              className="flex flex-col gap-4"
            >
              <label className="flex flex-col text-sm font-medium text-gray-700">
                Quest Name
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 border border-gray-300 rounded p-2"
                />
              </label>

              <label className="flex flex-col text-sm font-medium text-gray-700">
                Details
                <textarea
                  value={editDetails}
                  onChange={(e) => setEditDetails(e.target.value)}
                  className="mt-1 border border-gray-300 rounded p-2"
                />
              </label>

              <label className="block text-sm font-medium">
                <PickRegion
                  value={selectedRegion}
                  onChange={setSelectedRegion}
                />
              </label>

              <Dialog open={openStart} onOpenChange={setOpenStart}>
                <DialogTrigger asChild>
                  <Button>
                    {`Start Date: ${
                      editStart
                        ? new Date(editStart).toLocaleDateString('en-NZ', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Not set'
                    }`}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>
                    <VisuallyHidden>Choose Start Date</VisuallyHidden>
                  </DialogTitle>
                  <Calendar
                    mode="single"
                    selected={editStart ? new Date(editStart) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        // Adjust for timezone so we don’t get “day before”
                        const localDate = new Date(
                          date.getTime() - date.getTimezoneOffset() * 60000
                        )
                        setEditStart(localDate.toISOString().split('T')[0]) // "YYYY-MM-DD"
                      }
                    }}
                  />
                  <DialogClose asChild>
                    <Button>Confirm</Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>

              <Dialog open={openEnd} onOpenChange={setOpenEnd}>
                <DialogTrigger asChild>
                  <Button>
                    {`End Date: ${
                      editEnd
                        ? new Date(editEnd).toLocaleDateString('en-NZ', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Not set'
                    }`}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>
                    <VisuallyHidden>Choose End Date</VisuallyHidden>
                  </DialogTitle>
                  <Calendar
                    mode="single"
                    selected={editEnd ? new Date(editEnd) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        // Adjust for timezone so we don’t get “day before”
                        const localDate = new Date(
                          date.getTime() - date.getTimezoneOffset() * 60000
                        )
                        setEditEnd(localDate.toISOString().split('T')[0]) // "YYYY-MM-DD"
                      }
                    }}
                  />
                  <DialogClose asChild>
                    <Button>Confirm</Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
              <TaskCreatorButton
                questUpdates={tasks}
                onNewTask={handleTasksUpdate}
              />

              <div className="flex justify-end gap-3 mt-4">
                <DialogClose asChild>
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </DialogClose>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
