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
import TaskCreatorButton from '@/components/TaskCreatorButton'
import SponsorCreatorButton from '@/components/SponsorCreatorButton'
// import PrizeCreationButton from '@/components/PrizeCreation'
import RemoteImage from '@/components/RemoteImage'
import PickRegion from '@/components/PickRegion'
import placeHold from '@/assets/images/placeholder_view_vector.svg'
import bg from '@/assets/images/background_main.png'
// import { defaultImage } from '@/components/QuestListItem'
import {
  useInsertQuest,
  useUpdateQuest,
  useDeleteQuest,
  useQuest,
} from '@/hooks/userQuests'
import { Prize, Sponsor, Task } from '@/types'
// import { CreateQuestInput, UpdateQuestInput } from '@/graphql/API'
import { useCurrentUserProfile } from '@/hooks/userProfiles'
import { DialogTitle } from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@aws-amplify/ui-react'
import { uploadData, getUrl } from 'aws-amplify/storage'

export default function CreateQuestPage() {
  const navigate = useNavigate()
  const params = useParams()
  const questId = params.id // string | undefined
  const isUpdating = !!questId

  const [name, setName] = useState('')
  const [details, setDetails] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
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

    setImageFile(file) // keep for upload
    setPreviewImage(URL.createObjectURL(file)) // preview locally
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

  const onSubmit = async () => {
    if (!validateInput()) return

    // If a new file was selected, upload it
    const imagePath = imageFile ? await uploadImage(imageFile) : previewImage

    const payload = {
      quest_name: name,
      quest_details: details,
      quest_image: imagePath, // only string
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
      updateQuest(
        { id: questId!, ...payload },
        { onSuccess: () => navigate(-1) }
      )
    } else {
      insertQuest(payload, { onSuccess: () => navigate(-1) })
    }

    // Clear temp file state
    setImageFile(null)
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

  const uploadImage = async (file: File, isPublic = true): Promise<string> => {
    const prefix = isPublic ? 'public/' : 'private/'
    const path = `${prefix}${crypto.randomUUID()}-${file.name}`

    try {
      await uploadData({
        path,
        data: file,
        options: { contentType: file.type },
      })

      const result = await getUrl({ path })

      return result.url.toString() // <-- convert URL to string
    } catch (err) {
      console.error('Error uploading file:', err)
      return ''
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="w-full max-w-3xl p-6 bg-white/80 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold">
          {isUpdating ? 'Update Quest' : 'Create Quest'}
        </h1>

        {previewImage ? (
          <img src={previewImage} className="w-1/2 mx-auto rounded-lg" />
        ) : (
          <RemoteImage
            path={previewImage}
            fallback={placeHold}
            className="w-1/2 mx-auto rounded-lg"
          />
        )}

        <input type="file" accept="image/*" onChange={handleImageChange} />
        <label className="block text-sm font-medium">
          Quest Title
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">
          Quest Region
          <PickRegion value={selectedRegion} onChange={setSelectedRegion} />
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
              <DialogTitle>
                <VisuallyHidden>Choose Start Date</VisuallyHidden>
              </DialogTitle>
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
              <DialogTitle>
                <VisuallyHidden>Choose End Date</VisuallyHidden>
              </DialogTitle>
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
        <SponsorCreatorButton
          sponsorUpdates={sponsors}
          onNewSponsor={setSponsors}
        />
        <TaskCreatorButton questUpdates={tasks} onNewTask={setTasks} />

        <Button onClick={onSubmit}>{isUpdating ? 'Update' : 'Create'}</Button>
        {isUpdating && (
          <Button variant="destructive" onClick={confirmDelete}>
            Delete
          </Button>
        )}

        {errors && <p className="text-red-600">{errors}</p>}
      </div>
    </div>
  )
}
