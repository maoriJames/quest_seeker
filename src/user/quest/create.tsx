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
import { useMutateQuest, useQuest } from '@/hooks/userQuests'
import { Prize, Sponsor, Task } from '@/types'
// import { useCurrentUserProfile } from '@/hooks/userProfiles'
// import { getCurrentUser } from 'aws-amplify/auth'
import { DialogTitle } from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@aws-amplify/ui-react'
import { uploadData } from 'aws-amplify/storage'
import imageCompression from 'browser-image-compression'
import { MutateQuestAction, QuestStatus } from '@/graphql/API'
import { toZonedTime } from 'date-fns-tz'

export default function CreateQuestPage() {
  const navigate = useNavigate()
  const params = useParams()
  const questId = params.id
  const isUpdating = !!questId

  const [createdQuestId, setCreatedQuestId] = useState<string | null>(null)

  const effectiveQuestId = questId ?? createdQuestId
  // const isEffectivelyUpdating = !!effectiveQuestId

  const currencyExp = /^\d*\.?\d{0,2}$/

  const [name, setName] = useState('')
  const [details, setDetails] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string>('')
  const [startDateTime, setStartDateTime] = useState<string>('')
  const [endDateTime, setEndDateTime] = useState<string>('')
  const [sponsorsEnabled, setSponsorsEnabled] = useState(false)
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

  const { mutateAsync: mutateQuest } = useMutateQuest()

  // const { data: currentUser } = useCurrentUserProfile()
  // const creatorId = currentUser?.id ?? ''

  const { data: updatingQuest } = useQuest(questId)

  // --- Prefill fields if editing ---
  useEffect(() => {
    if (!isUpdating) return
    if (!updatingQuest) return

    setName(updatingQuest.quest_name ?? '')
    setDetails(updatingQuest.quest_details ?? '')
    setPreviewImage(updatingQuest.quest_image ?? '')
    setStartDateTime(updatingQuest.quest_start_at ?? startDateTime)
    setEndDateTime(updatingQuest.quest_end_at ?? endDateTime)
    setPrizeEnabled(!!updatingQuest.quest_prize)
    setPrizes(
      updatingQuest.quest_prize_info
        ? JSON.parse(updatingQuest.quest_prize_info)
        : [],
    )
    setSponsors(
      updatingQuest.quest_sponsor
        ? JSON.parse(updatingQuest.quest_sponsor)
        : [],
    )
    setSelectedRegion(updatingQuest.region ?? '')
    setCurrencyValue(updatingQuest.quest_entry?.toString() ?? '')
    setTasks(
      updatingQuest.quest_tasks ? JSON.parse(updatingQuest.quest_tasks) : [],
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

  const isPublishedQuest =
    isUpdating && updatingQuest?.status === QuestStatus.published

  const isDraftBeingPublished =
    isUpdating && updatingQuest?.status === QuestStatus.draft

  const NZ_TZ = 'Pacific/Auckland'

  // UI (NZT) → UTC ISO (for state / payload)
  const nzToUtcIso = (date: Date) => {
    const nzDate = toZonedTime(date, NZ_TZ)
    return nzDate.toISOString()
  }

  // UTC ISO → NZ Date (for UI)
  const utcIsoToNzDate = (iso: string) => {
    return toZonedTime(new Date(iso), NZ_TZ)
  }

  // UTC ISO → HH:mm (NZT, for <input type="time">)
  const utcIsoToNzTime = (iso: string) =>
    utcIsoToNzDate(iso).toLocaleTimeString('en-NZ', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

  function getTodayInNZ() {
    const nowNz = toZonedTime(new Date(), NZ_TZ)
    nowNz.setHours(0, 0, 0, 0)
    return nowNz
  }

  const getMinEndNzDate = (startUtcIso: string) => {
    const startNz = utcIsoToNzDate(startUtcIso)
    const minEnd = new Date(startNz)
    minEnd.setHours(minEnd.getHours() + 1)
    return minEnd
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
      const compressedFullFile = await imageCompression(file, {
        maxWidthOrHeight: 1400, // good balance for quality
        maxSizeMB: 1, // ~1MB max
        fileType: 'image/webp',
        useWebWorker: true,
      })

      await uploadData({
        path: fullPath,
        data: compressedFullFile,
        options: {
          contentType: 'image/webp',
        },
      })

      // 2️⃣ Convert + upload THUMBNAIL (WebP)
      const compressedThumbFile = await imageCompression(file, {
        maxWidthOrHeight: 300,
        maxSizeMB: 0.2,
        fileType: 'image/webp',
        useWebWorker: true,
      })

      await uploadData({
        path: thumbPath,
        data: compressedThumbFile,
        options: {
          contentType: 'image/webp',
        },
      })
      return { fullPath, thumbPath }
    } catch (err) {
      console.error('Error uploading file:', err)
      return { fullPath: '', thumbPath: '' }
    }
  }
  // const formatGraphQLErrors = (err: any) => {
  //   // Case A: you threw the GraphQLResult directly (your screenshot-like object)
  //   const errs = err?.errors ?? err?.data?.errors

  //   if (Array.isArray(errs) && errs.length) {
  //     return errs.map((e: any) => e?.message ?? JSON.stringify(e)).join('\n')
  //   }

  //   // Case B: normal JS error
  //   return err?.message ?? String(err)
  // }

  const saveQuest = async (status: QuestStatus) => {
    if (status === QuestStatus.published && !validateInput()) return

    try {
      const imagePaths = imageFile
        ? await uploadImage(imageFile)
        : { fullPath: previewImage, thumbPath: '' }

      const basePayload = {
        name,
        details,
        imagePath: imagePaths.fullPath,
        imageThumbPath: imagePaths.thumbPath,
        startAt: startDateTime,
        endAt: endDateTime,
        region: selectedRegion,
        entryFee: currencyValue ? Number(currencyValue) : null,
        prizes: prizes?.length ? JSON.stringify(prizes) : null,
        sponsors: sponsors?.length ? JSON.stringify(sponsors) : null,
        tasks: tasks?.length ? JSON.stringify(tasks) : null,
      }

      let currentQuestId = effectiveQuestId

      // ------------------------------------
      // Ensure questId exists
      // ------------------------------------
      if (!currentQuestId) {
        const draftResult = await mutateQuest({
          action: MutateQuestAction.CREATE_DRAFT,
          ...basePayload,
        })

        const newQuestId = draftResult?.questId
        if (!newQuestId) {
          console.error('CREATE_DRAFT result:', draftResult)
          throw new Error('CREATE_DRAFT returned no questId')
        }

        setCreatedQuestId(newQuestId)
        currentQuestId = newQuestId // ✅ CRITICAL LINE
      }

      // ------------------------------------
      // Now questId ALWAYS exists
      // ------------------------------------
      const action =
        status === QuestStatus.published
          ? MutateQuestAction.PUBLISH
          : MutateQuestAction.UPDATE_DRAFT

      await mutateQuest({
        action,
        questId: currentQuestId, // ✅ always defined
        ...basePayload,
      })

      navigate(-1)
    } catch (err) {
      console.error('saveQuest failed:', err)
      // setErrors(formatGraphQLErrors(err))
    }
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
              <Button
                variant="yellow"
                onClick={() => {
                  const confirmLeave = window.confirm(
                    'Are you sure you want to leave this page? Any unsaved changes will be lost.',
                  )

                  if (confirmLeave) {
                    navigate(-1)
                  }
                }}
              >
                Back to Quests
              </Button>
            </div>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            <div className="flex justify-between mt-4">
              <Button
                variant="outline"
                disabled={isPublishedQuest}
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
              <Button
                variant="yellow"
                onClick={() => {
                  const confirmLeave = window.confirm(
                    'Are you sure you want to leave this page? Any unsaved changes will be lost.',
                  )

                  if (confirmLeave) {
                    navigate(-1)
                  }
                }}
              >
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
                disabled={isPublishedQuest}
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
              <Button
                variant="yellow"
                onClick={() => {
                  const confirmLeave = window.confirm(
                    'Are you sure you want to leave this page? Any unsaved changes will be lost.',
                  )

                  if (confirmLeave) {
                    navigate(-1)
                  }
                }}
              >
                Back to Quests
              </Button>
            </div>
            <PickRegion value={selectedRegion} onChange={setSelectedRegion} />
            <div className="flex justify-between mt-4">
              <Button onClick={prev}>Back</Button>
              <Button
                variant="outline"
                disabled={isPublishedQuest}
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
              <Button
                variant="yellow"
                onClick={() => {
                  const confirmLeave = window.confirm(
                    'Are you sure you want to leave this page? Any unsaved changes will be lost.',
                  )

                  if (confirmLeave) {
                    navigate(-1)
                  }
                }}
              >
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
                disabled={isPublishedQuest}
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
              <Button
                variant="yellow"
                onClick={() => {
                  const confirmLeave = window.confirm(
                    'Are you sure you want to leave this page? Any unsaved changes will be lost.',
                  )

                  if (confirmLeave) {
                    navigate(-1)
                  }
                }}
              >
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
                disabled={isPublishedQuest}
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
              <Button
                variant="yellow"
                onClick={() => {
                  const confirmLeave = window.confirm(
                    'Are you sure you want to leave this page? Any unsaved changes will be lost.',
                  )

                  if (confirmLeave) {
                    navigate(-1)
                  }
                }}
              >
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
                  selected={
                    startDateTime ? utcIsoToNzDate(startDateTime) : undefined
                  }
                  disabled={(date) => date < getTodayInNZ()}
                  onSelect={(date) => {
                    if (!date) return

                    // user picked a NZ date → force 9am NZT
                    date.setHours(9, 0, 0, 0)

                    setStartDateTime(nzToUtcIso(date))
                  }}
                />
                <input
                  type="time"
                  value={
                    startDateTime ? utcIsoToNzTime(startDateTime) : '09:00'
                  }
                  onChange={(e) => {
                    if (!startDateTime) return

                    const [h, m] = e.target.value.split(':').map(Number)

                    const nzDate = utcIsoToNzDate(startDateTime)
                    nzDate.setHours(h, m, 0, 0)

                    setStartDateTime(nzToUtcIso(nzDate))
                  }}
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
                  selected={
                    endDateTime ? utcIsoToNzDate(endDateTime) : undefined
                  }
                  disabled={(date) => {
                    if (!startDateTime) {
                      return date < getTodayInNZ()
                    }

                    const minEndNz = getMinEndNzDate(startDateTime)

                    // Disable any date before start + 1 hour
                    const minEndDay = new Date(minEndNz)
                    minEndDay.setHours(0, 0, 0, 0)

                    return date < minEndDay
                  }}
                  onSelect={(date) => {
                    if (!date || !startDateTime) return

                    const minEndNz = getMinEndNzDate(startDateTime)

                    // Default to max(17:00, start + 1 hour)
                    const endNz = new Date(date)
                    endNz.setHours(17, 0, 0, 0)

                    if (endNz < minEndNz) {
                      endNz.setTime(minEndNz.getTime())
                    }

                    setEndDateTime(nzToUtcIso(endNz))
                  }}
                />

                <input
                  type="time"
                  value={endDateTime ? utcIsoToNzTime(endDateTime) : '17:00'}
                  onChange={(e) => {
                    if (!startDateTime || !endDateTime) return

                    const [h, m] = e.target.value.split(':').map(Number)

                    const endNz = utcIsoToNzDate(endDateTime)
                    endNz.setHours(h, m, 0, 0)

                    const minEndNz = getMinEndNzDate(startDateTime)

                    if (endNz < minEndNz) {
                      // snap to minimum allowed
                      setEndDateTime(nzToUtcIso(minEndNz))
                      return
                    }

                    setEndDateTime(nzToUtcIso(endNz))
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
                disabled={isPublishedQuest}
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
              <Button
                variant="yellow"
                onClick={() => {
                  const confirmLeave = window.confirm(
                    'Are you sure you want to leave this page? Any unsaved changes will be lost.',
                  )

                  if (confirmLeave) {
                    navigate(-1)
                  }
                }}
              >
                Back to Quests
              </Button>
            </div>

            <div className="flex justify-between items-center mt-6">
              <Button onClick={prev}>Back</Button>
              <Button
                variant="outline"
                disabled={isPublishedQuest}
                onClick={() => saveQuest(QuestStatus.draft)}
              >
                Save as Draft
              </Button>
              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setSponsorsEnabled(false)
                    setSponsors([])
                    setStep(8) // skip sponsor creator
                  }}
                >
                  No
                </Button>

                <Button
                  onClick={() => {
                    setSponsorsEnabled(true)
                    setStep(7)
                  }}
                >
                  Yes
                </Button>
              </div>
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
              <Button onClick={() => setStep(6)}>Back</Button>

              <Button
                variant="outline"
                disabled={isPublishedQuest}
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
              <Button
                variant="yellow"
                onClick={() => {
                  const confirmLeave = window.confirm(
                    'Are you sure you want to leave this page? Any unsaved changes will be lost.',
                  )

                  if (confirmLeave) {
                    navigate(-1)
                  }
                }}
              >
                Back to Quests
              </Button>
            </div>

            {/* Button row */}
            <div className="flex justify-between items-center mt-6">
              {/* Back button – far left */}
              <Button
                onClick={() => {
                  if (sponsorsEnabled) {
                    setStep(7)
                  } else {
                    setStep(6)
                  }
                }}
              >
                Back
              </Button>
              <Button
                variant="outline"
                disabled={isPublishedQuest}
                onClick={() => saveQuest(QuestStatus.draft)}
              >
                Save as Draft
              </Button>
              {/* Yes / No buttons – grouped on right */}
              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setPrizeEnabled(false)
                    setPrizes([])
                    setStep(10)
                  }}
                >
                  No
                </Button>

                <Button
                  onClick={() => {
                    setPrizeEnabled(true)
                    setStep(9)
                  }}
                >
                  Yes
                </Button>
              </div>
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
                disabled={isPublishedQuest}
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
              <Button
                onClick={() => {
                  if (prizeEnabled) {
                    setStep(9)
                  } else {
                    setStep(8)
                  }
                }}
              >
                Back
              </Button>
              <Button
                variant="outline"
                disabled={isPublishedQuest}
                onClick={() => saveQuest(QuestStatus.draft)}
              >
                Save as Draft
              </Button>
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
