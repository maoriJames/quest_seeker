import { generateClient, GraphQLResult } from 'aws-amplify/data'
import * as mutations from '@/graphql/mutations'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuest } from '@/hooks/userQuests'
import { useProfile, useCurrentUserProfile } from '@/hooks/userProfiles'
import { uploadData } from '@aws-amplify/storage'
import { useDeleteQuest } from '@/hooks/userQuests'
import bg from '@/assets/images/background_main.png'
import { VisuallyHidden } from '@aws-amplify/ui-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { useEffect, useState } from 'react'
import { Prize, MyQuest, Sponsor, Task, Profile } from '@/types'
import { addQuestToProfile } from '@/hooks/addQuestToProfile'
import RemoteImage from './RemoteImage'
import placeHold from '@/assets/images/placeholder_view_vector.svg'
import useEmblaCarousel from 'embla-carousel-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '@radix-ui/react-dialog'
import TaskInformationWindow from './TaskInformationWindow'
import { Pencil, Home } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@radix-ui/react-tooltip'
import PickRegion from './PickRegion'
import { Calendar } from './ui/calendar'
import TaskCreatorButton from './TaskCreatorButton'
import { deleteS3Object } from '@/tools/deleteS3Object'
import { parseQuestTasks, serializeQuestTasks } from '@/tools/questTasks'
import SponsorCreatorButton from './SponsorCreatorButton'
// import { Edit, Trash, Plus } from 'lucide-react'
import { Toolbar } from './Toolbar'
import TaskPreview from './TaskPreview'
import { GetProfileQuery, QuestStatus } from '@/graphql/API'
import { getProfile } from '@/graphql/queries'

export default function QuestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [joining, setJoining] = useState(false)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev()
  const scrollNext = () => emblaApi && emblaApi.scrollNext()
  const navigate = useNavigate()

  // 🧩 Fetch quest data
  const { data: quest, isLoading, error, refetch } = useQuest(id)
  const questCreatorProfile = useProfile(quest?.creator_id || '')
  const { data: currentUserProfile, refetch: refetchProfile } =
    useCurrentUserProfile()

  const [participantProfiles, setParticipantProfiles] = useState<Profile[]>([])
  const [participantsLoaded, setParticipantsLoaded] = useState(false)

  const [editName, setEditName] = useState(quest?.quest_name || '')
  const [editDetails, setEditDetails] = useState(quest?.quest_details || '')
  const [currentImageFile, setCurrentImageFile] = useState(
    quest?.quest_image || ''
  ) // current image file
  const [imageFile, setImageFile] = useState<File | null>(null) // new selected file
  const [previewImage, setPreviewImage] = useState<string>('') // URL for preview, could be S3 URL or blob

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
  const [sponsorsState, setSponsorsState] = useState<Sponsor[]>([])
  const [prizesState, setPrizesState] = useState<Prize[]>([])
  const [prizeEnabled, setPrizeEnabled] = useState(false)

  const deleteQuestMutation = useDeleteQuest()

  // Parse quest tasks when quest changes

  // Update edit fields when quest data is fetched
  useEffect(() => {
    if (!quest) return
    setEditName(quest.quest_name || '')
    setEditDetails(quest.quest_details || '')
    setEditStart(quest.quest_start || new Date().toISOString().split('T')[0])
    setEditEnd(quest.quest_end || new Date().toISOString().split('T')[0])
    setSelectedRegion(quest.region || '')

    const parsedTasks: Task[] = Array.isArray(quest.quest_tasks)
      ? quest.quest_tasks
      : JSON.parse(quest.quest_tasks || '[]')

    setTasks(parsedTasks)
  }, [quest])

  useEffect(() => {
    if (!quest) return
    try {
      setSponsorsState(
        quest.quest_sponsor ? JSON.parse(quest.quest_sponsor) : []
      )
      const parsedPrizes = quest.quest_prize_info
        ? JSON.parse(quest.quest_prize_info)
        : []
      setPrizesState(parsedPrizes)
      setPrizeEnabled(parsedPrizes.length > 0)
    } catch {
      setSponsorsState([])
      setPrizesState([])
      setPrizeEnabled(false)
    }
  }, [quest])

  useEffect(() => {
    if (quest?.quest_image) {
      setCurrentImageFile(quest.quest_image)
    }
  }, [quest?.quest_image])

  // --- Helpers ---
  // const getPublicUrl = (path: string) =>
  //   `https://amplify-amplifyvitereactt-amplifyquestseekerbucket-beyjfgpn1vr2.s3.ap-southeast-2.amazonaws.com/${path}`

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    setImageFile(file) // store the File
    setPreviewImage(URL.createObjectURL(file)) // update preview for <img>
  }

  useEffect(() => {
    if (open) {
      // when opening the modal, show the current quest image
      setPreviewImage(quest?.quest_image ?? '')
    } else {
      // when closing the modal, reset
      setPreviewImage('')
      setImageFile(null)
    }
  }, [open, quest?.quest_image])

  const client = generateClient()

  if (isLoading) return <p>Loading quest...</p>
  if (error) return <p>Failed to fetch quest.</p>
  if (!quest) return <p>Quest not found.</p>

  const handleDelete = async () => {
    if (!quest) return
    if (!window.confirm('Are you sure you want to delete this quest?')) return

    try {
      // Delete quest image
      console.log('quest image:', quest.quest_image)
      if (quest.quest_image) {
        console.log('quest image deleting?:')
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

      // Delete all prize images
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
        quest_status: QuestStatus.published,
      }

      await addQuestToProfile(quest.id, [userQuestEntry])

      // --- Update Quest participants safely ---
      const currentParticipants: string[] = quest.participants
        ? JSON.parse(quest.participants)
        : []

      // Only add if not already in the array
      if (!currentParticipants.includes(currentUserProfile!.id)) {
        currentParticipants.push(currentUserProfile!.id)
      }

      await client.graphql({
        query: mutations.updateQuest,
        variables: {
          input: {
            id: quest.id,
            participants: JSON.stringify(currentParticipants),
          },
        },
        authMode: 'userPool',
      })

      alert('✅ Quest added to your profile!')

      await await refetch()
      await refetchProfile()
    } catch (err) {
      console.error(err)
      alert('❌ Failed to join quest.')
    } finally {
      setJoining(false)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const path = `public/${crypto.randomUUID()}-${file.name}`

    try {
      await uploadData({
        path,
        data: file,
        options: { contentType: file.type },
      })
      return path // store S3 key in DB
    } catch (err) {
      console.error('Error uploading file:', err)
      return ''
    }
  }

  const handleEditSubmit = async () => {
    try {
      let imagePath = quest.quest_image ?? ''

      if (imageFile) {
        // Upload new image
        const uploadedPath = await uploadImage(imageFile)
        if (uploadedPath) {
          imagePath = uploadedPath

          // Delete old image from S3
          if (currentImageFile && currentImageFile !== uploadedPath) {
            await deleteS3Object(currentImageFile)
          }
        }
      }

      const input = {
        id: quest.id,
        quest_name: editName,
        quest_details: editDetails,
        quest_start: editStart,
        quest_end: editEnd,
        quest_tasks: serializeQuestTasks(tasks),
        region: selectedRegion,
        quest_image: imagePath,
        quest_sponsor: JSON.stringify(sponsorsState),
        quest_prize_info: JSON.stringify(prizesState),
        quest_prize: prizeEnabled,
      }

      await client.graphql({
        query: mutations.updateQuest,
        variables: { input },
        authMode: 'userPool',
      })

      await refetch()
      await refetchProfile()

      alert('Quest updated successfully!')

      // Reset preview and file
      setOpen(false)
      setImageFile(null)
      setPreviewImage('')

      // Update oldQuestImage to the new one
      setCurrentImageFile(imagePath)
    } catch (err) {
      console.error('❌ Failed to update quest:', err)
      alert('Failed to update quest.')
    }
  }

  const handleTasksUpdate = (updatedTasks: Task[]) => {
    setTasks(updatedTasks)
  }

  const participantsArray: string[] = quest.participants
    ? JSON.parse(quest.participants)
    : []

  const isOwner =
    currentUserProfile?.id === quest.creator_id &&
    currentUserProfile?.role === 'creator'

  const myQuestsArray: MyQuest[] =
    typeof currentUserProfile?.my_quests === 'string'
      ? JSON.parse(currentUserProfile.my_quests)
      : (currentUserProfile?.my_quests ?? [])
  // console.log('myQuestArray: ', myQuestsArray)
  const hasJoined = myQuestsArray.some((q) => q.quest_id === quest.id)
  const joinedQuestEntry = myQuestsArray.find((q) => q.quest_id === quest.id)

  const seekerTasks: Task[] = parseQuestTasks(quest?.quest_tasks).map(
    (task) => {
      const existingAnswer = joinedQuestEntry?.tasks?.find(
        (t) => t.id === task.id
      )
      return {
        ...task,
        caption: existingAnswer?.caption || '',
        answer: existingAnswer?.answer || '', // <-- use empty string instead of null
      }
    }
  )

  // Parse sponsors (safe check in case it's undefined or malformed)
  const sponsors: Sponsor[] = (() => {
    try {
      // console.log('Quest Sponsors: ', quest?.quest_sponsor)
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
  const displayedSponsors = sponsors.slice(0, 2)

  const handleOpenParticipants = async () => {
    if (participantsLoaded) return

    try {
      const profiles = await Promise.all(
        participantsArray.map(async (id) => {
          const res = await client.graphql<GraphQLResult<GetProfileQuery>>({
            query: getProfile,
            variables: { id },
            authMode: 'userPool',
          })

          // Type guard: only access 'data' if it exists
          if ('data' in res) {
            return res.data?.getProfile ?? null
          }

          return null
        })
      )

      setParticipantProfiles(profiles.filter(Boolean) as Profile[])
      setParticipantsLoaded(true)
    } catch (err) {
      console.error('Failed to fetch participant profiles:', err)
    }
  }
  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl max-w-5xl w-full flex flex-col">
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md p-2 rounded-md shadow-md">
            <Toolbar
              buttons={[
                {
                  label: <Home className="w-5 h-5" />,
                  onClick: () => navigate('/user/region'),
                },
                {
                  label: 'My Account',
                  onClick: () => navigate('/user/account'),
                },
                {
                  label: 'My Quests',
                  onClick: () =>
                    navigate('/user/account', {
                      state: { defaultTab: 'my-quests' },
                    }),
                },
                {
                  label: 'Leader Board',
                  onClick: () => navigate('/user/leader'),
                },
                { label: 'FAQ', onClick: () => navigate('/user/faq') },
              ]}
            />
          </div>

          {/* Banner Image with overlayed quest title + floating sponsors card */}
          <div className="relative w-full mb-20">
            {' '}
            {/* Increased bottom margin for the overlap */}
            {/* Banner Image */}
            <RemoteImage
              path={quest.quest_image || placeHold}
              fallback={placeHold}
              className="w-full h-[250px] md:h-[350px] object-cover rounded-t-2xl"
            />
            {/* Gradient overlay at bottom for contrast */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/70 to-transparent rounded-b-2xl" />
            {/* Overlayed quest name (left) */}
            <div className="absolute bottom-8 left-6 z-10">
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                {quest.quest_name}
              </h1>
            </div>
            {/* Floating white sponsors card (right) */}
            {displayedSponsors.length > 0 && (
              <div className="absolute left-1/2 md:left-auto md:right-10 bottom-[-60px] transform -translate-x-1/2 md:translate-x-0 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 md:p-5 flex flex-col items-center md:items-end gap-3 w-[90%] md:w-auto z-20">
                {/* Featured Sponsors link */}
                {sponsors.length >= 3 && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <span className="text-sm text-blue-600 font-medium underline cursor-pointer hover:text-blue-800">
                        Featured Sponsors
                      </span>
                    </DialogTrigger>
                    <DialogOverlay className="fixed inset-0 bg-black/30 z-40" />
                    <DialogContent className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-full max-w-lg bg-white rounded-xl p-6 shadow-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto">
                      <DialogTitle className="text-lg font-bold mb-4">
                        Featured Sponsors
                      </DialogTitle>

                      <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex">
                          {sponsors.map((sponsor) => (
                            <div
                              key={sponsor.id}
                              className="flex-[0_0_100%] flex flex-col items-center justify-center p-4"
                            >
                              <RemoteImage
                                path={sponsor.image || placeHold}
                                fallback={placeHold}
                                className="w-24 h-24 object-contain rounded-full mb-2"
                              />
                              <p className="font-semibold text-sm text-gray-700">
                                {sponsor.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <button
                          onClick={scrollPrev}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Previous
                        </button>
                        <button
                          onClick={scrollNext}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Next
                        </button>
                      </div>

                      <DialogClose asChild>
                        <button className="mt-6 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">
                          Close
                        </button>
                      </DialogClose>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Sponsor Avatars */}
                <div className="flex gap-4 flex-wrap justify-center md:justify-end">
                  {displayedSponsors.map((sponsor) => (
                    <div
                      key={sponsor.id}
                      className="flex flex-col items-center w-20 text-center"
                    >
                      <div className="p-[3px] bg-gradient-to-b from-gray-100 to-gray-200 rounded-full shadow-inner">
                        <RemoteImage
                          path={sponsor.image || placeHold}
                          fallback={placeHold}
                          className="w-14 h-14 object-contain rounded-full border border-gray-300 shadow-sm bg-white"
                        />
                      </div>
                      <span className="text-xs mt-1 font-semibold text-gray-700">
                        {sponsor.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Edit Button (top right of banner) */}
            {isOwner && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setOpen(true)}
                      className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white shadow z-20"
                    >
                      <Pencil className="w-5 h-5 text-gray-700" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg"
                  >
                    Edit quest image
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Quest details + Task list side by side */}
          <div className="flex flex-col lg:flex-row gap-6 mt-2 w-full">
            <div className="flex-1">
              <p className="text-gray-700 mb-2">{quest.quest_details}</p>
              <p className="text-sm text-gray-500 mb-1">
                Region: <strong>{quest.region}</strong>
              </p>
              <div className="text-sm mb-1">
                Organisation:{' '}
                {questCreatorProfile?.data?.organization_name ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <span className="text-blue-600 underline cursor-pointer">
                        {questCreatorProfile.data.organization_name}
                      </span>
                    </DialogTrigger>

                    <DialogOverlay className="fixed inset-0 bg-black/30 z-40" />
                    <DialogContent className="fixed top-1/2 left-1/2 z-50 max-h-[70vh] w-full max-w-md bg-white rounded-xl p-6 shadow-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto">
                      <RemoteImage
                        path={questCreatorProfile.data.image || placeHold}
                        fallback={placeHold}
                        className="w-32 h-32 rounded-full object-cover"
                      />
                      <DialogTitle className="text-lg font-bold mb-4">
                        {questCreatorProfile.data.organization_name}
                      </DialogTitle>

                      <div className="text-gray-700">
                        <p>
                          {questCreatorProfile.data.organization_description ||
                            'N/A'}
                        </p>
                      </div>
                      <DialogClose asChild>
                        <button className="mt-6 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">
                          Close
                        </button>
                      </DialogClose>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <span className="text-gray-500">N/A</span>
                )}
              </div>

              <p className="text-sm text-gray-500 mb-1">
                Start: <strong>{quest.quest_start}</strong>
              </p>
              <p className="text-sm text-gray-500">
                End: <strong>{quest.quest_end}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Number of tasks in this quest: <strong>{tasks.length}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Entry: <strong>${quest.quest_entry}</strong>
              </p>
              <p className="text-sm text-gray-500">
                People joined:
                {participantsArray.length > 0 && (
                  <Dialog
                    onOpenChange={(open) => open && handleOpenParticipants()}
                  >
                    <DialogTrigger asChild>
                      <button className="text-blue-600 underline font-medium text-sm">
                        {participantsArray.length} participant
                        {participantsArray.length > 1 ? 's' : ''}
                      </button>
                    </DialogTrigger>

                    <DialogOverlay className="fixed inset-0 bg-black/30 z-40" />
                    <DialogContent className="fixed top-1/2 left-1/2 z-50 max-h-[70vh] w-full max-w-md bg-white rounded-xl p-6 shadow-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto">
                      <DialogTitle className="text-lg font-bold mb-4">
                        Participants
                      </DialogTitle>

                      <div className="flex flex-col gap-3">
                        {participantProfiles.map((profile) => (
                          <div
                            key={profile.id}
                            className="flex items-center gap-3"
                          >
                            <RemoteImage
                              path={profile.image_thumbnail || placeHold}
                              fallback={placeHold}
                              className="w-32 h-32 rounded-full object-cover"
                            />

                            {/* Text stacked vertically */}
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                <strong>
                                  {profile.full_name || 'Unknown'}
                                </strong>
                              </span>

                              <span className="text-xs text-gray-600">
                                {profile.about_me || ''}
                              </span>
                            </div>
                          </div>
                        ))}

                        {participantProfiles.length === 0 && (
                          <p className="text-gray-500">Loading...</p>
                        )}
                      </div>

                      <DialogClose asChild>
                        <button className="mt-6 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">
                          Close
                        </button>
                      </DialogClose>
                    </DialogContent>
                  </Dialog>
                )}
              </p>
            </div>

            {(isOwner || hasJoined) && (
              <div className="lg:w-[450px] w-full">
                <TaskInformationWindow
                  questId={quest.id}
                  tasks={seekerTasks}
                  userTasks={myQuestsArray}
                  onTasksUpdated={async () => {
                    await refetch()
                    await refetchProfile()
                  }}
                  readOnly={isOwner} // <-- owner cannot answer tasks
                />
              </div>
            )}

            {!isOwner && !hasJoined && <TaskPreview tasks={tasks} />}
          </div>
          {/* Bottom action row: Delete/Join (left) + Back + Prize Info (right) */}
          <div className="mt-4 flex items-center justify-between w-full gap-4">
            {/* Left: Delete / Join */}
            <div className="flex items-center gap-2">
              {isOwner && (
                <Button
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Delete Quest
                </Button>
              )}

              {!isOwner &&
                (hasJoined ? (
                  <p className="text-green-600 font-semibold">✅ Joined!</p>
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

            {/* Right: Back + Prize Info */}
            <div className="flex items-center gap-3 ml-auto">
              {/* ⬅️ Back to Quests */}
              <Button onClick={() => navigate(-1)} variant="yellow">
                Back to Quests
              </Button>

              {/* 🏆 Prize Information Modal */}
              {prizes.length > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
                      Prize Information
                    </Button>
                  </DialogTrigger>

                  <DialogOverlay className="fixed inset-0 bg-black/30 z-40" />
                  <DialogContent className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-full max-w-lg bg-white rounded-xl p-6 shadow-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto">
                    <DialogTitle className="text-lg font-bold mb-4">
                      Prize Information
                    </DialogTitle>

                    {/* Carousel for prizes */}
                    <div className="overflow-hidden" ref={emblaRef}>
                      <div className="flex gap-4">
                        {prizes.map((prize) => (
                          <div
                            key={prize.id}
                            className="flex-[0_0_33.3333%] flex flex-col items-center justify-center p-2"
                          >
                            <RemoteImage
                              path={prize.image || placeHold}
                              fallback={placeHold}
                              className="w-20 h-20 object-contain rounded"
                            />
                            <span className="text-xs mt-1 font-semibold text-gray-700">
                              {prize.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Navigation only if more than 4 prizes */}
                    {prizes.length > 4 && (
                      <div className="flex justify-between items-center mt-4">
                        <button
                          onClick={() => emblaApi?.scrollPrev()}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => emblaApi?.scrollNext()}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Next
                        </button>
                      </div>
                    )}

                    <DialogClose asChild>
                      <button className="mt-6 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">
                        Close
                      </button>
                    </DialogClose>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isOwner && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogOverlay className="fixed inset-0 bg-black/40 z-40" />
          <DialogContent className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-full max-w-lg bg-white rounded-xl p-6 shadow-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto">
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
              {/* Quest Image */}
              <label className="flex flex-col text-sm font-medium text-gray-700">
                Quest Image
                {previewImage ? (
                  <RemoteImage
                    path={previewImage || quest.quest_image}
                    fallback={placeHold}
                    className="max-w-[100px] max-h-[100px] w-auto h-auto object-contain rounded-full"
                  />
                ) : (
                  <RemoteImage
                    path={quest.quest_image || placeHold}
                    fallback={placeHold}
                    className="max-w-[100px] max-h-[100px] w-auto h-auto object-contain rounded-full"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>

              {/* Quest Name */}
              <label className="flex flex-col text-sm font-medium text-gray-700">
                Quest Name
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 border border-gray-300 rounded p-2"
                />
              </label>

              {/* Quest Details */}
              <label className="flex flex-col text-sm font-medium text-gray-700">
                Details
                <textarea
                  value={editDetails}
                  onChange={(e) => setEditDetails(e.target.value)}
                  className="mt-1 border border-gray-300 rounded p-2"
                />
              </label>

              {/* Region */}
              <label className="block text-sm font-medium">
                <PickRegion
                  value={selectedRegion}
                  onChange={setSelectedRegion}
                />
              </label>

              {/* Start Date */}
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
                <DialogContent className="max-h-[70vh] overflow-y-auto">
                  <DialogTitle>
                    <VisuallyHidden>Choose Start Date</VisuallyHidden>
                  </DialogTitle>
                  <Calendar
                    mode="single"
                    selected={editStart ? new Date(editStart) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        const localDate = new Date(
                          date.getTime() - date.getTimezoneOffset() * 60000
                        )
                        setEditStart(localDate.toISOString().split('T')[0])
                      }
                    }}
                  />
                  <DialogClose asChild>
                    <Button>Confirm</Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>

              {/* End Date */}
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
                <DialogContent className="max-h-[70vh] overflow-y-auto">
                  <DialogTitle>
                    <VisuallyHidden>Choose End Date</VisuallyHidden>
                  </DialogTitle>
                  <Calendar
                    mode="single"
                    selected={editEnd ? new Date(editEnd) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        const localDate = new Date(
                          date.getTime() - date.getTimezoneOffset() * 60000
                        )
                        setEditEnd(localDate.toISOString().split('T')[0])
                      }
                    }}
                  />
                  <DialogClose asChild>
                    <Button>Confirm</Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>

              {/* Task Editor */}
              <TaskCreatorButton
                questUpdates={tasks}
                onNewTask={handleTasksUpdate}
              />

              {/* Sponsor & Prize Editor */}
              <SponsorCreatorButton
                sponsorUpdates={sponsorsState}
                onNewSponsor={setSponsorsState}
              />

              {/* Action Buttons */}
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
