'use client'

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
// import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import TaskCreatorButton from '@/components/TaskCreatorButton'
import SponsorCreatorButton from '@/components/SponsorCreatorButton'
import RemoteImage from '@/components/RemoteImage'
import PickRegion from '@/components/PickRegion'
import placeHold from '@/assets/images/placeholder_view_vector.svg'
import bg from '@/assets/images/background_main.png'
import {
  useInsertQuest,
  useUpdateQuest,
  useDeleteQuest,
  useQuest,
} from '@/hooks/userQuests'
import { Prize, Sponsor, Task } from '@/types'
import { useCurrentUserProfile } from '@/hooks/userProfiles'
import { DialogTitle } from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@aws-amplify/ui-react'
import { uploadData } from 'aws-amplify/storage'
// import PrizeCreatorButton from '@/components/PrizeCreatorButton'

export default function CreateQuestPage() {
  const navigate = useNavigate()
  const params = useParams()
  const questId = params.id
  const isUpdating = !!questId
  const currencyExp = /^\d*\.?\d{0,2}$/

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
  const [openStart, setOpenStart] = useState(false)
  const [openEnd, setOpenEnd] = useState(false)

  const { mutate: insertQuest } = useInsertQuest()
  const { mutate: updateQuest } = useUpdateQuest()
  const { mutate: deleteQuest } = useDeleteQuest()
  const { data: currentUser } = useCurrentUserProfile()
  const creatorId = currentUser?.id ?? ''

  const { data: updatingQuest } = useQuest(questId)

  // --- Pre-fill fields if editing ---
  useEffect(() => {
    if (!updatingQuest) return

    setName(updatingQuest.quest_name ?? '')
    setDetails(updatingQuest.quest_details ?? '')
    setPreviewImage(updatingQuest.quest_image ?? '')
    setStartDate(updatingQuest.quest_start ?? startDate)
    setEndDate(updatingQuest.quest_end ?? endDate)
    setPrizeEnabled(!!updatingQuest.quest_prize)
    setPrizes(
      updatingQuest.quest_prize_info
        ? JSON.parse(updatingQuest.quest_prize_info)
        : []
    )
    setSponsors(
      updatingQuest.quest_sponsor ? JSON.parse(updatingQuest.quest_sponsor) : []
    )
    setSelectedRegion(updatingQuest.region ?? '')
    setCurrencyValue(updatingQuest.quest_entry?.toString() ?? '')
    setTasks(
      updatingQuest.quest_tasks ? JSON.parse(updatingQuest.quest_tasks) : []
    )
  }, [updatingQuest])

  // --- Helpers ---
  const getPublicUrl = (path: string) =>
    `https://amplify-amplifyvitereactt-amplifyquestseekerbucket-beyjfgpn1vr2.s3.ap-southeast-2.amazonaws.com/${path}`

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)
    setPreviewImage(URL.createObjectURL(file))
    console.log('imageFile', imageFile)
  }

  const validateInput = () => {
    setErrors('')
    if (!name) return (setErrors('Name is required'), false)
    if (!details) return (setErrors('Details are required'), false)
    if (!startDate) return (setErrors('Start date required'), false)
    if (!endDate) return (setErrors('End date required'), false)
    return true
  }

  const uploadImage = async (file: File): Promise<string> => {
    const path = `public/${crypto.randomUUID()}-${file.name}`

    try {
      await uploadData({
        path,
        data: file,
        options: { contentType: file.type },
      })

      return path // store path in DB, generate full URL when rendering
    } catch (err) {
      console.error('Error uploading file:', err)
      return ''
    }
  }

  const onSubmit = async () => {
    if (!validateInput()) return

    const imagePath = imageFile ? await uploadImage(imageFile) : previewImage

    const payload = {
      quest_name: name,
      quest_details: details,
      quest_image: imagePath,
      quest_start: startDate,
      quest_end: endDate,
      quest_prize: prizeEnabled,
      quest_prize_info: JSON.stringify(prizes),
      quest_sponsor: JSON.stringify(sponsors),
      region: selectedRegion,
      quest_entry: Number(currencyValue),
      quest_tasks: JSON.stringify(tasks),
      creator_id: creatorId,
    }
    console.log(payload)
    if (isUpdating) {
      updateQuest(
        { id: questId!, ...payload },
        { onSuccess: () => navigate(-1) }
      )
    } else {
      insertQuest(payload, { onSuccess: () => navigate(-1) })
    }

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

  // --- Render ---
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
          <img
            src={imageFile ? previewImage : getPublicUrl(previewImage)}
            className="w-1/2 mx-auto rounded-lg"
          />
        ) : (
          <RemoteImage
            path={placeHold}
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
            inputMode="decimal"
            type="text"
            value={currencyValue}
            onChange={(e) => {
              const val = e.target.value
              // allow empty, or numbers matching regex
              if (val === '' || currencyExp.test(val)) {
                setCurrencyValue(val)
              }
            }}
            onBlur={() => {
              if (currencyValue !== '') {
                // format to 2 decimal places
                setCurrencyValue(parseFloat(currencyValue).toFixed(2))
              }
            }}
          />
        </label>

        <div className="flex space-x-2">
          <Dialog open={openStart} onOpenChange={setOpenStart}>
            <DialogTrigger asChild>
              <Button>
                {`Start Date: ${
                  startDate
                    ? new Date(startDate).toLocaleDateString('en-NZ', {
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
                selected={startDate ? new Date(startDate) : undefined}
                onSelect={(date) => {
                  if (date) {
                    // Adjust for timezone so we don’t get “day before”
                    const localDate = new Date(
                      date.getTime() - date.getTimezoneOffset() * 60000
                    )
                    setStartDate(localDate.toISOString().split('T')[0]) // "YYYY-MM-DD"
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
                  endDate
                    ? new Date(endDate).toLocaleDateString('en-NZ', {
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
                selected={endDate ? new Date(endDate) : undefined}
                onSelect={(date) => {
                  if (date) {
                    // Adjust for timezone so we don’t get “day before”
                    const localDate = new Date(
                      date.getTime() - date.getTimezoneOffset() * 60000
                    )
                    setEndDate(localDate.toISOString().split('T')[0]) // "YYYY-MM-DD"
                  }
                }}
              />
              <DialogClose asChild>
                <Button>Confirm</Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
        </div>

        {/* <div className="flex items-center space-x-2">
          <Switch checked={prizeEnabled} onCheckedChange={setPrizeEnabled} />
          <span>{prizeEnabled ? 'PRIZES' : 'NO PRIZES'}</span>
        </div> */}

        {/* {prizeEnabled && (
          <PrizeCreatorButton
            prizeUpdates={prizes}
            onNewPrize={setPrizes}
            prizeContributor={''}
          />
        )} */}

        <SponsorCreatorButton
          sponsorUpdates={sponsors}
          onNewSponsor={setSponsors}
        />
        <TaskCreatorButton questUpdates={tasks} onNewTask={setTasks} />

        <Button onClick={() => navigate(-1)} className="px-4 py-2">
          Cancel
        </Button>

        <Button onClick={onSubmit}>{isUpdating ? 'Update' : 'Create'}</Button>

        {isUpdating && (
          <Button
            variant="destructive"
            onClick={confirmDelete}
            className="mt-2"
          >
            Delete
          </Button>
        )}

        {errors && <p className="text-red-600 mt-2">{errors}</p>}
      </div>
    </div>
  )
}
