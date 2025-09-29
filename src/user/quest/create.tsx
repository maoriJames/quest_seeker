'use client'

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
// import RemoteImage from '@/components/RemoteImage'
import willowCat from '@/assets/images/willow_cat.png'
// import TaskCreatorButton from '@/components/TaskCreation'
// import SponsorCreatorButton from '@/components/SponsorCreator'
// import PrizeCreationButton from '@/components/PrizeCreation'
// import { defaultImage } from '@/components/QuestListItem'
import {
  useInsertQuest,
  useUpdateQuest,
  useDeleteQuest,
  useQuest,
} from '@/hooks/userQuests'
import { Prize, Sponsor, Task } from '@/types'
import { CreateQuestInput, UpdateQuestInput } from '@/graphql/API'
import { useCurrentUserProfile } from '@/hooks/userProfiles'

export default function CreateQuestPage() {
  const navigate = useNavigate()
  const params = useParams()
  const questId = params.id // string | undefined
  const isUpdating = !!questId

  const [name, setName] = useState('')
  const [details, setDetails] = useState('')
  const [imageFile, setImageFile] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string>('')
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [prizeEnabled, setPrizeEnabled] = useState(false)
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [currencyValue, setCurrencyValue] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [errors, setErrors] = useState<string>('')
  // const [isLoading, setIsLoading] = useState(false)
  const [openStart, setOpenStart] = useState(false)
  const [openEnd, setOpenEnd] = useState(false)

  const { mutate: insertQuest } = useInsertQuest()
  const { mutate: updateQuest } = useUpdateQuest()
  const { mutate: deleteQuest } = useDeleteQuest()
  const { data: currentUser } = useCurrentUserProfile()
  const creatorId = currentUser?.id

  const { data: updatingQuest } = useQuest(questId)

  // Pre-fill fields if editing
  useEffect(() => {
    if (updatingQuest) {
      setName(updatingQuest?.quest_name ?? '')
      setDetails(updatingQuest?.quest_details ?? '')
      setPreviewImage(updatingQuest?.quest_image ?? '')
      setStartDate(updatingQuest?.quest_start ?? startDate)
      setEndDate(updatingQuest?.quest_end ?? endDate)
      setPrizeEnabled(!!updatingQuest?.quest_prize)
      setPrizes(
        updatingQuest?.quest_prize_info
          ? updatingQuest.quest_prize_info.split(',').map((p, index) => ({
              id: `temp-${index}`,
              name: p.trim(),
              contributor: '',
            }))
          : []
      )
      setSponsors(
        updatingQuest?.quest_sponsor
          ? updatingQuest.quest_sponsor.split(',').map((s, i) => ({
              id: `temp-${i}`,
              name: s.trim(),
              sponsorImage: false,
              image: '',
            }))
          : []
      )
      setSelectedRegion(updatingQuest?.region ?? '')
      setCurrencyValue(updatingQuest?.quest_entry?.toString() ?? '')

      setTasks(
        updatingQuest?.quest_tasks
          ? updatingQuest.quest_tasks.split(',').map((t, i) => ({
              id: i,
              description: t.trim(),
              isImage: false,
              isChecked: false,
              caption: '',
              answer: '',
            }))
          : []
      )
    }
  }, [updatingQuest])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Example: store the file name (or construct a path for your bucket)
    setImageFile(file.name)

    // For preview, you can still create a URL
    setPreviewImage(URL.createObjectURL(file))
  }

  const validateInput = () => {
    setErrors('')
    if (!name) {
      setErrors('Name is required')
      return false
    }
    if (!details) {
      setErrors('Details are required')
      return false
    }
    if (!startDate) {
      setErrors('Start date required')
      return false
    }
    if (!endDate) {
      setErrors('End date required')
      return false
    }
    return true
  }

  const onSubmit = () => {
    if (!updatingQuest) return

    // Build the common payload fields
    const payloadBase = {
      quest_name: name,
      quest_details: details,
      quest_image: imageFile,
      quest_start: startDate,
      quest_end: endDate,
      quest_prize: prizeEnabled,
      quest_prize_info: JSON.stringify(prizes),
      quest_sponsor: JSON.stringify(sponsors),
      region: selectedRegion,
      quest_entry: Number(currencyValue),
      quest_tasks: JSON.stringify(tasks),
      creator_id: creatorId ?? '',
    }

    if (isUpdating) {
      if (!validateInput()) {
        return
      }
      const updatePayload: UpdateQuestInput = {
        ...payloadBase,
        id: questId!, // required for update
      }
      updateQuest(updatePayload, { onSuccess: () => navigate(-1) })
    } else {
      const createPayload: CreateQuestInput = {
        ...payloadBase,
      }
      insertQuest(createPayload, { onSuccess: () => navigate(-1) })
    }
  }

  const onDelete = () => {
    if (!questId) return
    deleteQuest(questId, {
      onSuccess: () => navigate('/admin', { replace: true }),
    })
  }

  const confirmDelete = () => {
    if (confirm('Delete this quest?')) onDelete()
  }

  // Stub for image upload
  // const uploadImage = async (file: File) => {
  //   // Replace with your Supabase or API upload logic
  //   return previewImage
  // }

  return (
    <div className="space-y-4 max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold">
        {isUpdating ? 'Update Quest' : 'Create Quest'}
      </h1>

      {previewImage ? (
        <img src={previewImage} className="w-1/2 mx-auto rounded-lg" />
      ) : (
        // <RemoteImage
        //   path={previewImage}
        //   fallback={defaultImage}
        //   className="w-1/2 mx-auto rounded-lg"
        // />
        <img
          src={willowCat}
          alt={'placeholder'}
          className="w-full aspect-square rounded-2xl object-cover"
        />
      )}

      <input type="file" accept="image/*" onChange={handleImageChange} />
      <label className="block text-sm font-medium">
        Quest Title
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="block text-sm font-medium">
        Quest Details
        <Textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="border rounded p-2 w-full"
        />
      </label>
      <label className="block text-sm font-medium">
        Seeker Entry Fee
        <Input
          value={currencyValue}
          onChange={(e) => setCurrencyValue(e.target.value)}
        />
      </label>
      {/* Date Pickers */}
      <div className="flex space-x-2">
        <Dialog open={openStart} onOpenChange={setOpenStart}>
          <DialogTrigger asChild>
            <Button>{`Start Date: ${startDate}`}</Button>
          </DialogTrigger>
          <DialogContent>
            <Calendar
              mode="single"
              selected={startDate ? new Date(startDate) : undefined}
              onSelect={(date) => {
                if (date) {
                  setStartDate(date.toISOString().split('T')[0])
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
            <Button>{`End Date: ${endDate}`}</Button>
          </DialogTrigger>
          <DialogContent>
            <Calendar
              mode="single"
              selected={endDate ? new Date(endDate) : undefined}
              onSelect={(date) => {
                if (date) {
                  setEndDate(date.toISOString().split('T')[0])
                }
              }}
            />
            <DialogClose asChild>
              <Button>Confirm</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </div>

      {/* Prize toggle */}
      <div className="flex items-center space-x-2">
        <Switch checked={prizeEnabled} onCheckedChange={setPrizeEnabled} />
        <span>{prizeEnabled ? 'PRIZES' : 'NO PRIZES'}</span>
      </div>

      {prizeEnabled && (
        // <PrizeCreationButton prizeUpdates={prizes} onNewPrize={setPrizes} />
        <Button className="w-full mt-6" onClick={() => {}}>
          Add Prize
        </Button>
      )}
      {/* <SponsorCreatorButton
        sponsorUpdates={sponsors}
        onNewSponsor={setSponsors}
      />
      <TaskCreatorButton questUpdates={tasks} onNewTask={setTasks} /> */}
      <Button className="w-full mt-6" onClick={() => {}}>
        Add Sponsor
      </Button>

      <Button className="w-full mt-6" onClick={() => {}}>
        Create Task
      </Button>

      <Button onClick={onSubmit}>{isUpdating ? 'Update' : 'Create'}</Button>
      {isUpdating && (
        <Button variant="destructive" onClick={confirmDelete}>
          Delete
        </Button>
      )}

      {errors && <p className="text-red-600">{errors}</p>}
    </div>
  )
}
