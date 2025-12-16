'use client'

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import TaskCreatorButton from '@/components/TaskCreatorButton'
import SponsorCreatorButton from '@/components/SponsorCreatorButton'
import PrizeCreatorButton from '@/components/PrizeCreatorButton'
import RemoteImage from '@/components/RemoteImage'
import PickRegion from '@/components/PickRegion'
import placeHold from '@/assets/images/placeholder_view_vector.svg'
import bg from '@/assets/images/background_main.png'
import { useInsertQuest, useUpdateQuest, useQuest } from '@/hooks/userQuests'
import { Prize, Sponsor, Task } from '@/types'
import { useCurrentUserProfile } from '@/hooks/userProfiles'
import { DialogTitle } from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@aws-amplify/ui-react'
import { uploadData } from 'aws-amplify/storage'
import imageCompression from 'browser-image-compression'
import { QuestStatus } from '@/graphql/API'
import { toZonedTime } from 'date-fns-tz'

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
  const [startDateTime, setStartDateTime] = useState<string>('')
  const [endDateTime, setEndDateTime] = useState<string>('')

  const [prizeEnabled, setPrizeEnabled] = useState(false)
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [currencyValue, setCurrencyValue] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [errors, setErrors] = useState<string>('')
  const [openStart, setOpenStart] = useState(false)
  const [openEnd, setOpenEnd] = useState(false)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(isUpdating) // Loading only for edit

  const next = () => setStep((s) => s + 1)
  const prev = () => setStep((s) => Math.max(0, s - 1))

  const { mutate: insertQuest } = useInsertQuest()
  const { mutate: updateQuest } = useUpdateQuest()
  const { data: currentUser } = useCurrentUserProfile()
  const creatorId = currentUser?.id ?? ''

  const { data: updatingQuest } = useQuest(questId)

  // --- Prefill fields if editing ---
  useEffect(() => {
    if (!isUpdating) return
    if (!updatingQuest) return

    setName(updatingQuest.quest_name ?? '')
    setDetails(updatingQuest.quest_details ?? '')
    setPreviewImage(updatingQuest.quest_image ?? '')
    setStartDateTime(updatingQuest.quest_start ?? startDateTime)
    setEndDateTime(updatingQuest.quest_end ?? endDateTime)
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

    setLoading(false)
  }, [updatingQuest])

  if (isUpdating && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading quest data...
      </div>
    )
  }

  // --- Helpers ---

  const isDraftBeingPublished =
    isUpdating && updatingQuest?.status === QuestStatus.draft

  const NZ_TZ = 'Pacific/Auckland'

  function nzDateTimeToUtc(dateTime: string) {
    // dateTime: "2025-12-06T09:00"
    return toZonedTime(dateTime, NZ_TZ).toISOString()
  }

  function getTodayInNZ() {
    const nowNz = toZonedTime(new Date(), NZ_TZ)
    nowNz.setHours(0, 0, 0, 0)
    return nowNz
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)
    setPreviewImage(URL.createObjectURL(file))
  }

  const validateInput = () => {
    setErrors('')
    if (!name) return (setErrors('Name is required'), false)
    if (!details) return (setErrors('Details are required'), false)
    if (!startDateTime) return (setErrors('Start date required'), false)
    if (!endDateTime) return (setErrors('End date required'), false)
    return true
  }

  const uploadImage = async (file: File) => {
    const fullPath = `public/${crypto.randomUUID()}-${file.name}`
    const thumbPath = `public/thumbnails/${crypto.randomUUID()}-${file.name}`

    try {
      await uploadData({
        path: fullPath,
        data: file,
        options: { contentType: file.type },
      })
      const compressedFile = await imageCompression(file, {
        maxWidthOrHeight: 300,
        maxSizeMB: 0.25,
        useWebWorker: true,
      })
      await uploadData({
        path: thumbPath,
        data: compressedFile,
        options: { contentType: file.type },
      })
      return { fullPath, thumbPath }
    } catch (err) {
      console.error('Error uploading file:', err)
      return { fullPath: '', thumbPath: '' }
    }
  }

  const saveQuest = async (status: QuestStatus) => {
    console.log('saveQuest called with status:', status)
    // console.log('Current form state:', {
    //   name,
    //   details,
    //   startDate,
    //   endDate,
    //   previewImage,
    //   prizeEnabled,
    //   prizes,
    //   sponsors,
    //   selectedRegion,
    //   currencyValue,
    //   tasks,
    // })

    if (status === QuestStatus.published && !validateInput()) {
      console.log('Validation failed, not saving.')
      return
    }

    const imagePaths = imageFile
      ? await uploadImage(imageFile)
      : { fullPath: previewImage, thumbPath: '' }

    console.log('Image paths:', imagePaths)

    const payload = {
      quest_name: name,
      quest_details: details,
      quest_image: imagePaths.fullPath,
      quest_image_thumb: imagePaths.thumbPath,
      quest_start: nzDateTimeToUtc(startDateTime),
      quest_end: nzDateTimeToUtc(endDateTime),
      quest_prize: prizeEnabled,
      quest_prize_info: JSON.stringify(prizes),
      quest_sponsor: JSON.stringify(sponsors),
      region: selectedRegion,
      quest_entry: currencyValue ? Number(currencyValue) : null,
      quest_tasks: JSON.stringify(tasks),
      creator_id: creatorId,
      status,
    }

    console.log('Payload to send:', payload)

    if (isUpdating) {
      console.log('Updating quest with id:', questId)
      updateQuest(
        { id: questId!, ...payload },
        {
          onSuccess: (data) => {
            console.log('Update successful:', data)
            navigate(-1)
          },
          onError: (err) => {
            console.error('Update failed:', err)
          },
        }
      )
    } else {
      console.log('Inserting new quest')
      insertQuest(payload, {
        onSuccess: (data) => {
          console.log('Insert successful:', data)
          navigate(-1)
        },
        onError: (err) => {
          console.error('Insert failed:', err)
        },
      })
    }

    setImageFile(null)
  }

  // --- Render ---
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="w-full max-w-3xl p-6 bg-white/80 rounded-lg shadow-md">
        {/* --- Multi-step UI --- */}
        {step === 0 && (
          <>
            <div className="flex justify-between mt-4">
              <h2 className="text-xl font-bold mb-4">Name of the quest</h2>
              <Button variant="yellow" onClick={() => navigate(-1)}>
                Back to Quests
              </Button>
            </div>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            <div className="flex justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => saveQuest(QuestStatus.draft)}
              >
                Save as Draft
              </Button>
              <Button onClick={next}>Next</Button>
            </div>
          </>
        )}

        {/* Step 1: Image */}
        {step === 1 && (
          <>
            <div className="flex justify-between mt-4">
              <h2 className="text-xl font-bold mb-4">Quest Image</h2>
              <Button variant="yellow" onClick={() => navigate(-1)}>
                Back to Quests
              </Button>
            </div>

            {previewImage ? (
              <RemoteImage
                path={previewImage || updatingQuest?.quest_image}
                fallback={placeHold}
                className="w-1/2 mx-auto rounded-lg"
              />
            ) : (
              <RemoteImage
                path={updatingQuest?.quest_image || placeHold}
                fallback={placeHold}
                className="w-1/2 mx-auto rounded-lg"
              />
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} />
            <div className="flex justify-between mt-4">
              <Button onClick={prev}>Back</Button>
              <Button
                variant="outline"
                onClick={() => saveQuest(QuestStatus.draft)}
              >
                Save as Draft
              </Button>
              <Button onClick={next}>Next</Button>
            </div>
          </>
        )}

        {/* Step 2: Region */}
        {step === 2 && (
          <>
            <div className="flex justify-between mt-4">
              <h2 className="text-xl font-bold mb-4">Select Region</h2>
              <Button variant="yellow" onClick={() => navigate(-1)}>
                Back to Quests
              </Button>
            </div>
            <PickRegion value={selectedRegion} onChange={setSelectedRegion} />
            <div className="flex justify-between mt-4">
              <Button onClick={prev}>Back</Button>
              <Button
                variant="outline"
                onClick={() => saveQuest(QuestStatus.draft)}
              >
                Save as Draft
              </Button>
              <Button onClick={next}>Next</Button>
            </div>
          </>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <>
            <div className="flex justify-between mt-4">
              <h2 className="text-xl font-bold mb-4">Quest Details</h2>
              <Button variant="yellow" onClick={() => navigate(-1)}>
                Back to Quests
              </Button>
            </div>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="border rounded p-2 w-full"
            />
            <div className="flex justify-between mt-4">
              <Button onClick={prev}>Back</Button>
              <Button
                variant="outline"
                onClick={() => saveQuest(QuestStatus.draft)}
              >
                Save as Draft
              </Button>
              <Button onClick={next}>Next</Button>
            </div>
          </>
        )}

        {/* Step 4: Entry Fee */}
        {step === 4 && (
          <>
            <div className="flex justify-between mt-4">
              <h2 className="text-xl font-bold mb-4">Entry Fee</h2>
              <Button variant="yellow" onClick={() => navigate(-1)}>
                Back to Quests
              </Button>
            </div>
            <Input
              inputMode="decimal"
              type="text"
              value={currencyValue}
              onChange={(e) => {
                const val = e.target.value
                if (val === '' || currencyExp.test(val)) setCurrencyValue(val)
              }}
              onBlur={() => {
                if (currencyValue !== '')
                  setCurrencyValue(parseFloat(currencyValue).toFixed(2))
              }}
            />
            <div className="flex justify-between mt-4">
              <Button onClick={prev}>Back</Button>
              <Button
                variant="outline"
                onClick={() => saveQuest(QuestStatus.draft)}
              >
                Save as Draft
              </Button>
              <Button onClick={next}>Next</Button>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <div className="flex justify-between mt-4">
              <h2 className="text-xl font-bold mb-4">Quest Dates</h2>
              <Button variant="yellow" onClick={() => navigate(-1)}>
                Back to Quests
              </Button>
            </div>
            {/* --- Start Date Picker --- */}
            <Dialog open={openStart} onOpenChange={setOpenStart}>
              <DialogTrigger asChild>
                <Button>
                  {`Start Date: ${
                    startDateTime
                      ? new Date(startDateTime).toLocaleDateString('en-NZ', {
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
                  selected={startDateTime ? new Date(startDateTime) : undefined}
                  disabled={(date) => date < getTodayInNZ()}
                  onSelect={(date) => {
                    if (!date) return

                    const localDate = new Date(
                      date.getTime() - date.getTimezoneOffset() * 60000
                    )
                    const datePart = localDate.toISOString().split('T')[0]
                    setStartDateTime(`${datePart}T09:00`)
                  }}
                />

                <input
                  type="time"
                  value={startDateTime.split('T')[1] ?? '09:00'}
                  onChange={(e) => {
                    const time = e.target.value
                    const date = startDateTime.split('T')[0]
                    if (date) setStartDateTime(`${date}T${time}`)
                  }}
                  className="mt-2"
                />

                <DialogClose asChild>
                  <Button>Confirm</Button>
                </DialogClose>
              </DialogContent>
            </Dialog>

            {/* --- End Date Picker --- */}
            <Dialog open={openEnd} onOpenChange={setOpenEnd}>
              <DialogTrigger asChild>
                <Button>
                  {`End Date: ${
                    endDateTime
                      ? new Date(endDateTime).toLocaleDateString('en-NZ', {
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
                  selected={endDateTime ? new Date(endDateTime) : undefined}
                  disabled={(date) => {
                    const todayNz = getTodayInNZ()
                    const minEnd = startDateTime
                      ? new Date(startDateTime)
                      : todayNz
                    minEnd.setDate(minEnd.getDate() + 1)

                    return date < minEnd
                  }}
                  onSelect={(date) => {
                    if (date) {
                      const localDate = new Date(
                        date.getTime() - date.getTimezoneOffset() * 60000
                      )
                      const minEnd = new Date(startDateTime)
                      minEnd.setDate(minEnd.getDate() + 1)

                      if (localDate >= minEnd) {
                        setEndDateTime(localDate.toISOString().split('T')[0])
                      } else {
                        // Optionally alert the user or auto-set it
                        setEndDateTime(minEnd.toISOString().split('T')[0])
                      }
                    }
                  }}
                />
                <input
                  type="time"
                  value={endDateTime.split('T')[1] ?? '17:00'}
                  onChange={(e) => {
                    const time = e.target.value
                    const date = endDateTime.split('T')[0]
                    if (date) setEndDateTime(`${date}T${time}`)
                  }}
                  className="mt-2"
                />
                <DialogClose asChild>
                  <Button>Confirm</Button>
                </DialogClose>
              </DialogContent>
            </Dialog>

            <div className="flex justify-between mt-4">
              <Button onClick={prev}>Back</Button>
              <Button
                variant="outline"
                onClick={() => saveQuest(QuestStatus.draft)}
              >
                Save as Draft
              </Button>
              <Button onClick={next}>Next</Button>
            </div>
          </>
        )}

        {step === 6 && (
          <>
            <div className="flex justify-between mt-4">
              <h2 className="text-xl font-bold">Any Sponsors?</h2>
              <Button variant="yellow" onClick={() => navigate(-1)}>
                Back to Quests
              </Button>
            </div>
            <div className="flex gap-4 mt-4">
              <Button
                onClick={() => {
                  setSponsors([])
                  setStep(8)
                }}
              >
                No
              </Button>

              <Button
                onClick={() => {
                  setStep(7)
                }}
              >
                Yes
              </Button>
            </div>
          </>
        )}

        {step === 7 && (
          <>
            <SponsorCreatorButton
              sponsorUpdates={sponsors}
              onNewSponsor={setSponsors}
            />
            <div className="flex justify-between mt-4">
              <Button onClick={prev}>Back</Button>
              <Button
                variant="outline"
                onClick={() => saveQuest(QuestStatus.draft)}
              >
                Save as Draft
              </Button>
              <Button onClick={next}>Next</Button>
            </div>
          </>
        )}

        {step === 8 && (
          <>
            <div className="flex justify-between mt-4">
              <h2 className="text-xl font-bold">Any Prizes?</h2>
              <Button variant="yellow" onClick={() => navigate(-1)}>
                Back to Quests
              </Button>
            </div>
            <div className="flex gap-4 mt-4">
              <Button
                onClick={() => {
                  setPrizes([])
                  setStep(10)
                }}
              >
                No
              </Button>

              <Button
                onClick={() => {
                  setStep(9)
                }}
              >
                Yes
              </Button>
            </div>
          </>
        )}

        {step === 9 && (
          <>
            <PrizeCreatorButton
              onNewPrize={setPrizes}
              prizeUpdates={prizes}
              prizeContributor={''}
            />
            <div className="flex justify-between mt-4">
              <Button onClick={prev}>Back</Button>
              <Button
                variant="outline"
                onClick={() => saveQuest(QuestStatus.draft)}
              >
                {isDraftBeingPublished ? 'Save Draft' : 'Save as Draft'}
              </Button>
              <Button onClick={next}>Next</Button>
            </div>
          </>
        )}

        {step === 10 && (
          <>
            <TaskCreatorButton questUpdates={tasks} onNewTask={setTasks} />
            <div className="flex justify-between mt-4">
              <Button onClick={prev}>Back</Button>
              <Button
                variant="yellow"
                onClick={() => saveQuest(QuestStatus.published)}
              >
                {isDraftBeingPublished
                  ? 'Save and Publish Quest'
                  : isUpdating
                    ? 'Save Changes'
                    : 'Finish & Create Quest'}
              </Button>
            </div>
          </>
        )}

        {errors && <p className="text-red-600 mt-2">{errors}</p>}
      </div>
    </div>
  )
}
