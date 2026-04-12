import { generateClient, GraphQLResult } from 'aws-amplify/data'
import { getCurrentUser } from 'aws-amplify/auth'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useQuest,
  useQuestParticipants,
  useUserQuests,
} from '@/hooks/userQuests'
import { useProfile, useCurrentUserProfile } from '@/hooks/userProfiles'
import bg from '@/assets/images/background_main.png'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { useEffect, useState } from 'react'
import { Prize, Sponsor, Task, Profile, UserQuest } from '@/types'
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
import { Toolbar } from './Toolbar'
import TaskPreview from './TaskPreview'
import { GetProfileQuery, QuestStatus } from '@/graphql/API'
import { getProfile } from '@/graphql/queries'
import SignOutButton from './SignOutButton'
import { useQuestDeletion } from '@/hooks/useQuestDeletion'
import { PDFDownloadLink } from '@react-pdf/renderer'
import SeekerTaskPdfButton from '@/components/SeekerTaskPdfButton'
import { format, toZonedTime } from 'date-fns-tz'
import { getUrl } from 'aws-amplify/storage'
import { ensureArray } from '@/tools/ensureArray'
import { joinQuest, createQuestEntrySession } from '@/graphql/mutations'

export default function QuestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [joining, setJoining] = useState(false)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const { deleteQuest, loading: deleting } = useQuestDeletion()

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev()
  const scrollNext = () => emblaApi && emblaApi.scrollNext()
  const navigate = useNavigate()

  const { data: quest, isLoading, error, refetch } = useQuest(id)
  const questCreatorProfile = useProfile(quest?.creator_id || '')
  const { data: currentUserProfile, refetch: refetchProfile } =
    useCurrentUserProfile()

  // 🧩 Fetch quest data
  const { data: userQuests, refetch: refetchUserQuests } = useUserQuests(
    currentUserProfile?.id,
  )
  const { data: questParticipants } = useQuestParticipants(quest?.id)
  const participantIds = questParticipants?.map((uq) => uq.profileId) ?? []
  // console.log('Participant IDs:', participantIds)
  const [participantProfiles, setParticipantProfiles] = useState<Profile[]>([])
  const [participantsLoaded, setParticipantsLoaded] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [winner, setWinner] = useState<Profile | null>(null)

  const [pdfTasks, setPdfTasks] = useState<Task[]>([])
  const [pdfLoading, setPdfLoading] = useState(false)

  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const isExpired = quest?.status === QuestStatus.expired
  const NZ_TZ = 'Pacific/Auckland'
  // Update edit fields when quest data is fetched
  useEffect(() => {
    if (!quest) return
    setTasks(ensureArray<Task>(quest.quest_tasks))
  }, [quest])

  useEffect(() => {
    if (isExpired && !participantsLoaded && participantIds.length > 0) {
      handleOpenParticipants()
    }
  }, [isExpired, participantsLoaded, participantIds])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    if (!sessionId) return

    setPaymentSuccess(true)

    // Clean up the URL without triggering a reload
    const cleanUrl = window.location.pathname
    window.history.replaceState({}, '', cleanUrl)
  }, [])

  const client = generateClient()

  if (isLoading) return <p>Loading quest...</p>
  if (error) return <p>Failed to fetch quest.</p>
  if (!quest) return <p>Quest not found.</p>

  function formatNzDateTime(iso?: string | null) {
    if (!iso) return '—'

    const nzDate = toZonedTime(new Date(iso), NZ_TZ)

    return format(nzDate, 'd MMM yyyy, h:mm a', {
      timeZone: 'Pacific/Auckland',
    })
  }

  const preparePdfTasks = async (participantId?: string) => {
    setPdfLoading(true)

    // Determine which tasks to prepare
    let tasksToResolve: Task[]

    if (participantId) {
      // CREATOR VIEW: Get specific participant's tasks
      const participantQuest = questParticipants?.find(
        (uq) => uq.profileId === participantId,
      )

      if (!participantQuest) {
        setPdfLoading(false)
        return []
      }

      const participantTasks = Array.isArray(participantQuest.tasks)
        ? participantQuest.tasks
        : (() => {
            try {
              return typeof participantQuest.tasks === 'string'
                ? JSON.parse(participantQuest.tasks)
                : []
            } catch {
              return []
            }
          })()

      tasksToResolve = tasks.map((task) => {
        const existingAnswer = participantTasks.find(
          (t: { id: string }) => t.id === task.id,
        )
        return {
          ...task,
          caption: existingAnswer?.caption || '',
          answer: existingAnswer?.answer || '',
        }
      })
    } else {
      // SEEKER VIEW: Use current user's tasks
      tasksToResolve = seekerTasks
    }

    // Resolve image URLs
    const resolved = await Promise.all(
      tasksToResolve.map(async (task) => {
        if (!task.isImage || !task.answer) return task

        try {
          const { url } = await getUrl({
            path: task.answer, // ✅ path ONLY
          })

          return {
            ...task,
            answer: url.toString(), // full HTTPS URL
          }
        } catch (err) {
          console.error('Failed to resolve image URL:', err)
          return task
        }
      }),
    )

    setPdfTasks(resolved)
    setPdfLoading(false)
    return resolved // Return for immediate use
  }
  // 🔜 REMOVE MyQuest dependency — now uses UserQuest status
  const completedParticipants = participantProfiles.filter((profile) => {
    const userQuest = questParticipants?.find(
      (uq) => uq.profileId === profile.id,
    )
    if (!userQuest) return false
    if (userQuest.status === 'COMPLETED') return true

    // Fallback: check if all tasks are completed
    const tasks = Array.isArray(userQuest.tasks)
      ? userQuest.tasks
      : (() => {
          try {
            return typeof userQuest.tasks === 'string'
              ? JSON.parse(userQuest.tasks)
              : []
          } catch {
            return []
          }
        })()

    const taskCount = tasks.length
    if (taskCount === 0) return false
    return (
      tasks.filter((t: { completed: boolean }) => t.completed).length ===
      taskCount
    )
  })
  const pickRandomWinner = () => {
    if (completedParticipants.length === 0) return

    const randomIndex = Math.floor(Math.random() * completedParticipants.length)
    const selected = completedParticipants[randomIndex]

    setWinner(selected)
  }

  const handleJoinQuest = async () => {
    if (!quest?.id || !currentUserProfile?.id) return
    setJoining(true)
    try {
      const entryFee = quest.quest_entry ?? 0

      if (entryFee > 0) {
        // 💳 Paid quest — create Stripe checkout session
        const returnUrl = `${window.location.origin}/user/quest/${quest.id}`

        const result = await client.graphql({
          query: createQuestEntrySession,
          variables: {
            questId: quest.id,
            profileId: currentUserProfile.id,
            questName: quest.quest_name ?? 'Quest',
            entryFee,
            returnUrl,
          },
        })

        const sessionUrl = result.data?.createQuestEntrySession
        if (!sessionUrl) throw new Error('No session URL returned')

        // Redirect to Stripe — joining happens via webhook on success
        window.location.href = sessionUrl
      } else {
        // 🆓 Free quest — join directly
        await client.graphql({
          query: joinQuest,
          variables: {
            questId: quest.id,
            profileId: currentUserProfile.id,
          },
        })
        alert('✅ Quest added to your profile!')
        await refetch()
        await refetchProfile()
        await refetchUserQuests()
      }
    } catch (err) {
      console.error('❌ Failed to join quest:', err)
      alert('Failed to join quest.')
    } finally {
      setJoining(false)
    }
  }

  const isOwner =
    currentUserProfile?.id === quest.creator_id &&
    currentUserProfile?.role === 'creator'

  const joinedQuestEntry = userQuests?.find((uq) => uq.questId === quest.id)
  const hasJoined = !!joinedQuestEntry
  const joinedTasks = Array.isArray(joinedQuestEntry?.tasks)
    ? joinedQuestEntry.tasks
    : (() => {
        try {
          return typeof joinedQuestEntry?.tasks === 'string'
            ? JSON.parse(joinedQuestEntry.tasks)
            : []
        } catch {
          return []
        }
      })()

  const totalTasks = joinedTasks.length

  const completedTasks = joinedTasks.filter(
    (t: { completed: boolean }) => t.completed,
  ).length
  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const seekerTasks = tasks.map((task) => {
    const existingAnswer = joinedTasks.find(
      (t: { id: string }) => t.id === task.id,
    )
    return {
      ...task,
      caption: existingAnswer?.caption || '',
      answer: existingAnswer?.answer || '',
    }
  })

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

  const displayedSponsors = sponsors.slice(0, 2)

  const handleOpenParticipants = async () => {
    if (participantsLoaded) return
    // console.log('Fetching profiles for IDs:', participantIds)
    try {
      const { signInDetails } = await getCurrentUser()
      // console.log('signInDetails', signInDetails)
      const currentEmail = signInDetails?.loginId ?? ''

      const profiles = await Promise.all(
        participantIds.map(async (id) => {
          // console.log('Fetching profile for ID:', id)
          const res = await client.graphql<GraphQLResult<GetProfileQuery>>({
            query: getProfile,
            variables: { id },
            authMode: 'userPool',
          })
          // console.log('Profile response for', id, ':', res)
          const profile = 'data' in res ? (res.data?.getProfile ?? null) : null

          if (profile && id === currentUserProfile?.id) {
            return { ...profile, email: currentEmail }
          }
          return profile
        }),
      )
      setParticipantProfiles(profiles.filter(Boolean) as Profile[])
      // console.log('Participant Profiles: ', profiles.filter(Boolean))
      setParticipantsLoaded(true)
    } catch (err) {
      console.error('Failed to fetch participant profiles:', err)
    }
  }

  const canEdit =
    quest.status === QuestStatus.draft ||
    (quest.status === QuestStatus.published && participantIds.length === 0)

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl max-w-5xl w-full flex flex-col">
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md p-2 rounded-md shadow-md">
            <Toolbar>
              <Button
                variant="yellow"
                onClick={() => navigate('/user/region')}
                size="icon"
                aria-label="Home"
              >
                <Home />
              </Button>

              <Button
                variant="yellow"
                onClick={() => navigate('/user/account')}
              >
                My Account
              </Button>

              <Button
                variant="yellow"
                onClick={() =>
                  navigate('/user/account', {
                    state: { defaultTab: 'my-quests' },
                  })
                }
              >
                My Quests
              </Button>

              <Button variant="yellow" onClick={() => navigate('/user/leader')}>
                Leader Board
              </Button>

              <Button variant="yellow" onClick={() => navigate('/user/help')}>
                Help
              </Button>
              <SignOutButton />
            </Toolbar>
          </div>

          {/* Banner Image with overlayed quest title + floating sponsors card */}
          <div className="relative w-full mb-4 md:mb-20">
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

            {/* Sponsors card */}
            {displayedSponsors.length > 0 && (
              <div
                className="
      absolute top-2 right-2 flex flex-col items-end gap-1 z-20
      md:top-auto md:right-10 md:bottom-[-60px]
      md:bg-white md:rounded-2xl md:shadow-xl md:border md:border-gray-200
      md:p-5 md:gap-3
    "
              >
                {/* Featured Sponsors link — desktop only */}
                {sponsors.length >= 3 && (
                  <div className="hidden md:block">
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
                  </div>
                )}

                {/* Sponsor Avatars */}
                <div className="flex gap-2 md:gap-4 flex-wrap justify-end">
                  {displayedSponsors.map((sponsor) => (
                    <div
                      key={sponsor.id}
                      className="flex flex-col items-center w-10 md:w-20 text-center"
                    >
                      <div className="p-[2px] md:p-[3px] bg-white/80 md:bg-gradient-to-b md:from-gray-100 md:to-gray-200 rounded-full shadow">
                        <RemoteImage
                          path={sponsor.image || placeHold}
                          fallback={placeHold}
                          className="w-8 h-8 md:w-14 md:h-14 object-contain rounded-full border border-gray-300 shadow-sm bg-white"
                        />
                      </div>
                      {/* Sponsor name — desktop only */}
                      <span className="hidden md:block text-xs mt-1 font-semibold text-gray-700">
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
                      onClick={() => navigate(`/user/quest/${id}/edit`)}
                      className={`absolute top-4 right-4 p-2 rounded-full bg-white/80 shadow z-20 ${
                        !canEdit
                          ? 'cursor-not-allowed opacity-50 hover:bg-white/80'
                          : 'hover:bg-white'
                      }`}
                      disabled={!canEdit}
                    >
                      <Pencil className="w-5 h-5 text-gray-700" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg"
                  >
                    {quest.status === QuestStatus.expired
                      ? 'Expired quests cannot be edited'
                      : participantIds.length > 0
                        ? 'Quests with participants cannot be edited'
                        : !canEdit
                          ? 'Only draft and published quests with no participants can be edited'
                          : 'Edit quest'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-6 mt-2 w-full">
            {/* ---------------- LEFT SIDE ---------------- */}
            <div className="flex-1">
              {isExpired ? (
                /* ---------- EXPIRED VERSION: Show only the 4 fields ---------- */
                <>
                  <p className="text-gray-700 mb-2">{quest.quest_details}</p>

                  <p className="text-sm text-gray-500 mb-1">
                    Region: <strong>{quest.region}</strong>
                  </p>

                  {/* Changed from <p> to <div> */}
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
                            path={
                              questCreatorProfile.data.image_thumbnail ||
                              placeHold
                            }
                            fallback={placeHold}
                            className="w-32 h-32 rounded-full object-cover"
                          />
                          <DialogTitle className="text-lg font-bold mb-4">
                            {questCreatorProfile.data.organization_name}
                          </DialogTitle>
                          <p className="text-gray-700">
                            {questCreatorProfile.data
                              .organization_description || 'N/A'}
                          </p>
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

                  {/* Changed from <p> to <div> */}
                  <div className="text-sm text-gray-500">
                    Ended on:{' '}
                    <strong>{formatNzDateTime(quest.quest_end_at)}</strong>
                  </div>

                  {/* Changed from <p> to <div> */}
                  <div>
                    <div className="text-sm text-gray-500">
                      People who joined:
                      {participantIds.length > 0 && (
                        <Dialog
                          onOpenChange={(open) =>
                            open && handleOpenParticipants()
                          }
                        >
                          <DialogTrigger asChild>
                            <button className="text-blue-600 underline font-medium text-sm">
                              {participantIds.length} participant
                              {participantIds.length > 1 ? 's' : ''}
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
                    </div>
                  </div>
                </>
              ) : (
                /* ---------- NORMAL VERSION (NOT EXPIRED) ---------- */
                <>
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
                            path={
                              questCreatorProfile.data.image_thumbnail ||
                              placeHold
                            }
                            fallback={placeHold}
                            className="w-32 h-32 rounded-full object-cover"
                          />
                          <DialogTitle className="text-lg font-bold mb-4">
                            {questCreatorProfile.data.organization_name}
                          </DialogTitle>
                          <p className="text-gray-700">
                            {questCreatorProfile.data
                              .organization_description || 'N/A'}
                          </p>
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
                    Start:{' '}
                    <strong>{formatNzDateTime(quest.quest_start_at)}</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    End: <strong>{formatNzDateTime(quest.quest_end_at)}</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    Number of tasks in this quest:{' '}
                    <strong>{ensureArray<Task>(tasks).length}</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    Entry: <strong>${quest.quest_entry}</strong>
                  </p>

                  {/* Participant count block remains */}
                  <p className="text-sm text-gray-500">
                    People joined:
                    {participantIds.length > 0 && (
                      <Dialog
                        onOpenChange={(open) =>
                          open && handleOpenParticipants()
                        }
                      >
                        <DialogTrigger asChild>
                          <button className="text-blue-600 underline font-medium text-sm">
                            {participantIds.length} participant
                            {participantIds.length > 1 ? 's' : ''}
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
                </>
              )}
            </div>

            {/* ---------------- RIGHT SIDE ---------------- */}

            {isExpired ? (
              <div className="lg:w-[450px] w-full bg-white/70 p-4 rounded-xl shadow">
                {isOwner ? (
                  // 👑 CREATOR VIEW
                  <>
                    <h3 className="text-lg font-bold mb-3">
                      Participants Who Completed This Quest
                    </h3>

                    {!participantsLoaded ? (
                      <p className="text-gray-500">Loading participants...</p>
                    ) : completedParticipants.length === 0 ? (
                      <p className="text-gray-500">
                        No participants have completed all tasks for this quest.
                      </p>
                    ) : (
                      <>
                        {/* Scrollable participant list */}
                        <div className="flex flex-col gap-3 mb-4 max-h-72 overflow-y-auto pr-1">
                          {completedParticipants.map((profile) => {
                            if (!profile?.id) return null

                            return (
                              <div
                                key={profile.id}
                                className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm hover:bg-yellow-50 transition border border-gray-100"
                              >
                                <RemoteImage
                                  path={profile.image_thumbnail || placeHold}
                                  fallback={placeHold}
                                  className="w-12 h-12 rounded-full object-cover shrink-0"
                                />

                                <div className="flex flex-col flex-1 min-w-0">
                                  <span className="font-semibold text-gray-800 truncate">
                                    {profile.full_name || 'Unknown User'}
                                  </span>
                                  <span className="text-xs text-gray-500 truncate">
                                    {profile.email || ''}
                                  </span>
                                </div>

                                {!pdfLoading && pdfTasks.length > 0 ? (
                                  /* The actual PDF Link */
                                  <PDFDownloadLink
                                    key={profile.id}
                                    document={
                                      <SeekerTaskPdfButton
                                        quest={quest}
                                        seekerTasks={pdfTasks}
                                        user={profile}
                                      />
                                    }
                                    fileName={`${quest.quest_name}-${profile.full_name ?? 'participant'}.pdf`}
                                  >
                                    {({ loading }) => (
                                      <span className="text-xs text-blue-600 font-medium shrink-0 cursor-pointer">
                                        {loading
                                          ? 'Generating...'
                                          : '⬇ Download PDF'}
                                      </span>
                                    )}
                                  </PDFDownloadLink>
                                ) : (
                                  /* The Initial "Prepare" Button */
                                  <button
                                    onClick={() => preparePdfTasks(profile.id)}
                                    disabled={pdfLoading}
                                    className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg w-full transition-colors"
                                  >
                                    {pdfLoading ? (
                                      <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                        Preparing Tasks...
                                      </span>
                                    ) : (
                                      'Prepare PDF'
                                    )}
                                  </button>
                                )}
                              </div>
                            )
                          })}
                        </div>

                        <button
                          onClick={pickRandomWinner}
                          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-lg shadow"
                        >
                          Pick Random Winner
                        </button>

                        {/* 🧩 Task Window */}
                        <TaskInformationWindow
                          questId={quest.id}
                          tasks={seekerTasks}
                          userTasks={
                            joinedQuestEntry
                              ? [joinedQuestEntry as UserQuest]
                              : []
                          }
                          readOnly={isOwner}
                          onTasksUpdated={async () => {
                            await refetch()
                            await refetchUserQuests()
                          }}
                        />

                        {winner && (
                          <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg flex items-center gap-3">
                            <RemoteImage
                              path={winner.image_thumbnail || placeHold}
                              fallback={placeHold}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-bold text-green-800 text-lg">
                                🎉 Winner!
                              </p>
                              <p className="font-semibold">
                                {winner.full_name}
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  // 🧭 SEEKER VIEW

                  <>
                    <h3 className="text-lg font-bold mb-3">
                      Your Completed Quest
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      This quest has ended. See your completed quest details
                      below.
                    </p>

                    {currentUserProfile && (
                      <div className="flex flex-col gap-3">
                        {!pdfLoading && pdfTasks.length > 0 ? (
                          <PDFDownloadLink
                            document={
                              <SeekerTaskPdfButton
                                quest={quest}
                                seekerTasks={pdfTasks}
                                user={currentUserProfile}
                              />
                            }
                            fileName={`${quest.quest_name}-your-answers.pdf`}
                          >
                            {({ loading }) => (
                              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full">
                                {loading
                                  ? 'Generating PDF...'
                                  : '⬇ Download My Quest PDF'}
                              </button>
                            )}
                          </PDFDownloadLink>
                        ) : (
                          <button
                            onClick={() => preparePdfTasks()}
                            disabled={pdfLoading}
                            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg w-full transition-colors"
                          >
                            {pdfLoading ? (
                              <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                Preparing Tasks...
                              </span>
                            ) : (
                              'Prepare PDF'
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              // ... non-expired JSX unchanged
              <>
                {(isOwner || hasJoined) && (
                  <div className="lg:w-[450px] w-full bg-white/80 p-4 rounded-xl shadow flex flex-col gap-4">
                    {/* 🔵 Progress Bar (joined seekers only) */}
                    {hasJoined && !isOwner && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-gray-700">
                            Quest Progress
                          </span>
                          <span className="text-sm text-gray-600">
                            {completedTasks} / {totalTasks} tasks
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-3 bg-green-500 transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>

                        <p className="text-xs text-gray-500 mt-1 text-right">
                          {progressPercent}% complete
                        </p>
                      </div>
                    )}

                    {/* 🧩 Task Window */}
                    <TaskInformationWindow
                      questId={quest.id}
                      tasks={seekerTasks}
                      userTasks={
                        joinedQuestEntry ? [joinedQuestEntry as UserQuest] : []
                      }
                      readOnly={isOwner}
                      onTasksUpdated={async () => {
                        await refetch()
                        await refetchUserQuests()
                      }}
                    />
                  </div>
                )}

                {!isOwner && !hasJoined && (
                  <TaskPreview tasks={ensureArray(tasks)} />
                )}
              </>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3 w-full">
            {/* Payment success banner */}
            {paymentSuccess && (
              <div className="w-full bg-green-100 border border-green-300 text-green-800 rounded-lg px-4 py-3 text-sm font-medium flex items-center gap-2">
                🎉 Payment successful! You've joined the quest.
              </div>
            )}

            {/* Bottom action row: Delete/Join (left) + Back + Prize Info (right) */}
            <div className="mt-4 flex items-center justify-between w-full gap-4">
              {/* Left: Delete / Join */}
              <div className="flex items-center gap-2">
                {isOwner && participantIds.length < 1 && (
                  <Button
                    onClick={() => deleteQuest(quest)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Delete Quest'}
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
                      {joining
                        ? 'Joining...'
                        : quest.quest_entry && quest.quest_entry > 0
                          ? `Join for $${quest.quest_entry}`
                          : 'Join the quest!'}
                    </button>
                  ))}
              </div>

              {/* Right: Back + Prize Info */}
              <div className="flex items-center gap-3 ml-auto">
                {/* ⬅️ Back to Quests */}
                <Button
                  onClick={() => navigate('/user/home?region=')}
                  variant="yellow"
                >
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
