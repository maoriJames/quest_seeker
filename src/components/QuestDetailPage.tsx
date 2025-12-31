import { generateClient, GraphQLResult } from 'aws-amplify/data'
import * as mutations from '@/graphql/mutations'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuest } from '@/hooks/userQuests'
import { useProfile, useCurrentUserProfile } from '@/hooks/userProfiles'
import bg from '@/assets/images/background_main.png'
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
import { parseQuestTasks } from '@/tools/questTasks'
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

export default function QuestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [joining, setJoining] = useState(false)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const { deleteQuest, loading: deleting } = useQuestDeletion()

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
  const [tasks, setTasks] = useState<Task[]>([])
  const [winner, setWinner] = useState<Profile | null>(null)

  const [pdfTasks, setPdfTasks] = useState<Task[]>([])
  const [pdfLoading, setPdfLoading] = useState(false)

  const isAdmin = currentUserProfile?.role === 'admin'

  const isExpired = quest?.status === QuestStatus.expired
  const NZ_TZ = 'Pacific/Auckland'
  // Update edit fields when quest data is fetched
  useEffect(() => {
    if (!quest) return

    const parsedTasks: Task[] = Array.isArray(quest.quest_tasks)
      ? quest.quest_tasks
      : JSON.parse(quest.quest_tasks || '[]')

    setTasks(parsedTasks)
  }, [quest])

  useEffect(() => {
    if (isExpired && !participantsLoaded) {
      handleOpenParticipants()
    }
  }, [isExpired])

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

  const preparePdfTasks = async () => {
    setPdfLoading(true)

    const resolved = await Promise.all(
      seekerTasks.map(async (task) => {
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
      })
    )

    setPdfTasks(resolved)
    setPdfLoading(false)
  }

  const pickRandomWinner = () => {
    if (completedParticipants.length === 0) return

    const randomIndex = Math.floor(Math.random() * completedParticipants.length)
    const selected = completedParticipants[randomIndex]

    setWinner(selected)
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
        // quest_status: QuestStatus.published,
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

  const participantsArray: string[] = quest.participants
    ? JSON.parse(quest.participants)
    : []

  const isOwner =
    currentUserProfile?.id === quest.creator_id &&
    currentUserProfile?.role === 'creator'

  const canEditQuest = !isExpired && (isOwner || isAdmin)

  const myQuestsArray: MyQuest[] =
    typeof currentUserProfile?.my_quests === 'string'
      ? JSON.parse(currentUserProfile.my_quests)
      : (currentUserProfile?.my_quests ?? [])
  // console.log('myQuestArray: ', myQuestsArray)
  const hasJoined = myQuestsArray.some((q) => q.quest_id === quest.id)
  const joinedQuestEntry = myQuestsArray.find((q) => q.quest_id === quest.id)

  const totalTasks = joinedQuestEntry?.tasks?.length ?? 0

  const completedTasks =
    joinedQuestEntry?.tasks?.filter((t) => t.completed).length ?? 0

  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

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

  const completedParticipants = participantProfiles.filter((profile) => {
    // Parse participant's my_quests
    const myQuestsRaw = profile.my_quests ?? []
    const myQuests: MyQuest[] =
      typeof myQuestsRaw === 'string' ? JSON.parse(myQuestsRaw) : myQuestsRaw

    // Find this quest's entry for this participant
    const questEntry = myQuests.find((q) => q.quest_id === quest.id)
    console.log('questEntry: ', questEntry)
    if (!questEntry) return false

    // ✅ 1) If the MyQuest-level completed flag is true, we’re done
    if (questEntry.completed) return true

    // ✅ 2) Fallback: require all tasks to be marked completed
    const taskCount = questEntry.tasks?.length ?? 0
    if (taskCount === 0) return false

    const completedCount =
      questEntry.tasks?.filter((t) => t.completed).length ?? 0

    return completedCount === taskCount
  })

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
    console.log('Participants Array: ', participantsArray.length)
  }
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
            {canEditQuest && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => navigate(`/user/quest/${id}/edit`)}
                      className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white shadow z-20"
                    >
                      <Pencil className="w-5 h-5 text-gray-700" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg"
                  >
                    Edit quest
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

                  <p className="text-sm text-gray-500">
                    Ends on:{' '}
                    <strong>{formatNzDateTime(quest.quest_end_at)}</strong>
                  </p>
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
                    <strong>{tasks.length}</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    Entry: <strong>${quest.quest_entry}</strong>
                  </p>

                  {/* Participant count block remains */}
                  <p className="text-sm text-gray-500">
                    People joined:
                    {participantsArray.length > 0 && (
                      <Dialog
                        onOpenChange={(open) =>
                          open && handleOpenParticipants()
                        }
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
                </>
              )}
            </div>

            {/* ---------------- RIGHT SIDE ---------------- */}

            {isExpired ? (
              <div className="lg:w-[450px] w-full bg-white/70 p-4 rounded-xl shadow">
                <h3 className="text-lg font-bold mb-3">
                  Participants Who Completed This Quest
                </h3>

                {/* SHOW “loading” if profiles haven't loaded yet */}
                {!participantsLoaded ? (
                  <p className="text-gray-500">Loading participants...</p>
                ) : completedParticipants.length === 0 ? (
                  <p className="text-gray-500">
                    No participants have completed all tasks for this quest.
                  </p>
                ) : (
                  <>
                    <div className="flex flex-col gap-3 mb-4">
                      {completedParticipants.map((profile) => (
                        <div
                          key={profile.id}
                          className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm"
                        >
                          <RemoteImage
                            path={profile.image_thumbnail || placeHold}
                            fallback={placeHold}
                            className="w-12 h-12 rounded-full object-cover"
                          />

                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-800">
                              {profile.full_name || 'Unknown User'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {profile.about_me || ''}
                            </span>
                          </div>
                        </div>
                      ))}
                      {hasJoined && !isOwner && currentUserProfile && (
                        <div className="mt-4">
                          <button
                            onClick={preparePdfTasks}
                            className="mb-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
                          >
                            Prepare PDF
                          </button>

                          {!pdfLoading && pdfTasks.length > 0 && (
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
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                                  {loading
                                    ? 'Generating PDF…'
                                    : 'Download My Quest PDF'}
                                </button>
                              )}
                            </PDFDownloadLink>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 🎯 Only quest creator sees this button */}
                    {isOwner && completedParticipants.length > 0 && (
                      <button
                        onClick={pickRandomWinner}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-lg shadow"
                      >
                        Pick Random Winner
                      </button>
                    )}

                    {/* 🏆 WINNER DISPLAY */}
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
                          <p className="font-semibold">{winner.full_name}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
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
                      userTasks={myQuestsArray}
                      readOnly={isOwner}
                      onTasksUpdated={async () => {
                        await refetch()
                        await refetchProfile()
                      }}
                    />
                  </div>
                )}

                {!isOwner && !hasJoined && <TaskPreview tasks={tasks} />}
              </>
            )}
          </div>

          {/* Bottom action row: Delete/Join (left) + Back + Prize Info (right) */}
          <div className="mt-4 flex items-center justify-between w-full gap-4">
            {/* Left: Delete / Join */}
            <div className="flex items-center gap-2">
              {(isOwner || isAdmin) && participantsArray.length < 1 && (
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
    </div>
  )
}
