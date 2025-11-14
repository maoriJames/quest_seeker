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
  // useDeleteQuest,
  useQuest,
} from '@/hooks/userQuests'
import { Prize, Sponsor, Task } from '@/types'
import { useCurrentUserProfile } from '@/hooks/userProfiles'
import { DialogTitle } from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@aws-amplify/ui-react'
import { uploadData } from 'aws-amplify/storage'
import imageCompression from 'browser-image-compression'
import PrizeCreatorButton from '@/components/PrizeCreatorButton'
import { QuestStatus } from '@/graphql/API'

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
  const [step, setStep] = useState(0)

  const next = () => setStep((s) => s + 1)
  const prev = () => setStep((s) => Math.max(0, s - 1))

  const { mutate: insertQuest } = useInsertQuest()
  const { mutate: updateQuest } = useUpdateQuest()
  // const { mutate: deleteQuest } = useDeleteQuest()
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
  // const getPublicUrl = (path: string) =>
  //   `https://amplify-amplifyvitereactt-amplifyquestseekerbucket-beyjfgpn1vr2.s3.ap-southeast-2.amazonaws.com/${path}`

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

  const uploadImage = async (
    file: File
  ): Promise<{ fullPath: string; thumbPath: string }> => {
    const fullPath = `public/${crypto.randomUUID()}-${file.name}`
    const thumbPath = `public/thumbnails/${crypto.randomUUID()}-${file.name}`

    try {
      // 1️⃣ Upload full image
      await uploadData({
        path: fullPath,
        data: file,
        options: { contentType: file.type },
      })

      // 2️⃣ Create a lightweight thumbnail (~300px wide)
      const compressedFile = await imageCompression(file, {
        maxWidthOrHeight: 300,
        maxSizeMB: 0.25,
        useWebWorker: true,
      })

      // 3️⃣ Upload the thumbnail
      await uploadData({
        path: thumbPath,
        data: compressedFile,
        options: { contentType: file.type },
      })

      // 4️⃣ Return both paths for DB storage
      return { fullPath, thumbPath }
    } catch (err) {
      console.error('Error uploading file:', err)
      return { fullPath: '', thumbPath: '' }
    }
  }

  const onSaveDraft = async () => {
    const imagePaths = imageFile
      ? await uploadImage(imageFile)
      : { fullPath: previewImage, thumbPath: '' }

    const payload = {
      quest_name: name,
      quest_details: details,
      quest_image: imagePaths.fullPath,
      quest_image_thumb: imagePaths.thumbPath,
      quest_start: startDate,
      quest_end: endDate,
      quest_prize: prizeEnabled,
      quest_prize_info: JSON.stringify(prizes),
      quest_sponsor: JSON.stringify(sponsors),
      region: selectedRegion,
      quest_entry: currencyValue ? Number(currencyValue) : null,
      quest_tasks: JSON.stringify(tasks),
      creator_id: creatorId,
      status: QuestStatus.draft,
    }

    console.log('Saving draft:', payload)

    if (isUpdating) {
      updateQuest(
        { id: questId!, ...payload },
        { onSuccess: () => navigate(-1) }
      )
    } else {
      insertQuest(payload, { onSuccess: () => navigate(-1) })
    }
  }

  const onSubmit = async () => {
    if (!validateInput()) return

    const imagePaths = imageFile
      ? await uploadImage(imageFile)
      : { fullPath: previewImage, thumbPath: '' }

    const payload = {
      quest_name: name,
      quest_details: details,
      quest_image: imagePaths.fullPath,
      quest_image_thumb: imagePaths.thumbPath,
      quest_start: startDate,
      quest_end: endDate,
      quest_prize: prizeEnabled,
      quest_prize_info: JSON.stringify(prizes),
      quest_sponsor: JSON.stringify(sponsors),
      region: selectedRegion,
      quest_entry: Number(currencyValue),
      quest_tasks: JSON.stringify(tasks),
      creator_id: creatorId,
      status: QuestStatus.published,
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

  // --- Render ---
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="w-full max-w-3xl p-6 bg-white/80 rounded-lg shadow-md">
        {step === 0 && (
          <>
            <h2 className="text-xl font-bold mb-4">Quest Title</h2>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            <Button className="mt-4" onClick={next}>
              Next
            </Button>
            <Button variant="outline" onClick={onSaveDraft}>
              Save as Draft
            </Button>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="text-xl font-bold mb-4">Quest Image</h2>
            {previewImage ? (
              <img src={previewImage} className="w-1/2 mx-auto rounded-lg" />
            ) : (
              <RemoteImage
                className="w-1/2 mx-auto rounded-lg"
                fallback={placeHold}
                path={placeHold}
              />
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} />
            <div className="flex justify-between mt-4">
              <Button onClick={prev}>Back</Button>
              <Button variant="outline" onClick={onSaveDraft}>
                Save as Draft
              </Button>
              <Button onClick={next}>Next</Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-bold mb-4">Select Region</h2>
            <PickRegion value={selectedRegion} onChange={setSelectedRegion} />
            <div className="flex justify-between mt-4">
              <Button onClick={prev}>Back</Button>
              <Button variant="outline" onClick={onSaveDraft}>
                Save as Draft
              </Button>
              <Button onClick={next}>Next</Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-xl font-bold mb-4">Quest Details</h2>
            <label className="block text-sm font-medium">
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="border rounded p-2 w-full"
              />
            </label>
            <div className="flex justify-between mt-4">
              <Button onClick={prev}>Back</Button>
              <Button variant="outline" onClick={onSaveDraft}>
                Save as Draft
              </Button>
              <Button onClick={next}>Next</Button>
            </div>
          </>
        )}
        {step === 4 && (
          <>
            <h2 className="text-xl font-bold mb-4">Entrry Fee</h2>
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
            <div className="flex justify-between mt-4">
              <Button onClick={prev}>Back</Button>
              <Button variant="outline" onClick={onSaveDraft}>
                Save as Draft
              </Button>
              <Button onClick={next}>Next</Button>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h2 className="text-xl font-bold mb-4">Quest Dates</h2>
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
            <div className="flex justify-between mt-4">
              <Button onClick={prev}>Back</Button>
              <Button variant="outline" onClick={onSaveDraft}>
                Save as Draft
              </Button>
              <Button onClick={next}>Next</Button>
            </div>
          </>
        )}

        {step === 6 && (
          <>
            <h2 className="text-xl font-bold">Any Sponsors?</h2>

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
              <Button variant="outline" onClick={onSaveDraft}>
                Save as Draft
              </Button>
              <Button onClick={next}>Next</Button>
            </div>
          </>
        )}

        {step === 8 && (
          <>
            <h2 className="text-xl font-bold">Any Prizes?</h2>
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
              <Button variant="outline" onClick={onSaveDraft}>
                Save as Draft
              </Button>
              <Button onClick={next}>Next</Button>
            </div>
          </>
        )}

        {step === 10 && (
          <>
            <TaskCreatorButton questUpdates={tasks} onNewTask={setTasks} />{' '}
            <div className="flex justify-between mt-4">
              <Button onClick={prev}>Back</Button>
              <Button onClick={onSubmit}>Finish & Create Quest</Button>
            </div>
          </>
        )}
        {errors && <p className="text-red-600 mt-2">{errors}</p>}
      </div>
    </div>
  )
}
