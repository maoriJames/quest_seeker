import { useLocation } from 'react-router-dom'
import QuestListItem from '@/components/QuestListItem'
import { useQuestList } from '@/hooks/userQuests'
import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import bg from '@/assets/images/background_main.png'
// import placeHold from '@/assets/images/placeholder_view_vector.svg'
import type { Quest } from '@/types' // <-- import your Quest type
import AddQuestButton from '@/components/AddQuestButton'

export default function QuestPage() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const selectedRegion = searchParams.get('region') || 'Browse all'

  // Fetch all quests
  const { data: quests, error, isLoading } = useQuestList()

  // Dummy quests for testing
  // const dummyQuests: Quest[] = [
  //   {
  //     id: 'dummy1',
  //     quest_name: 'Find the Chuchill',
  //     quest_details: 'Dummy quest details',
  //     quest_start: '2025-09-23',
  //     quest_end: '2025-12-31',
  //     quest_image: placeHold,
  //     region: 'Auckland',
  //     creator_id: 'sandbox-user',
  //   },
  //   {
  //     id: 'dummy2',
  //     quest_name: 'Test Quest 2',
  //     quest_details: 'Another dummy quest',
  //     quest_start: '2025-09-25',
  //     quest_end: '2025-12-31',
  //     quest_image: placeHold,
  //     region: 'Wellington',
  //     creator_id: 'sandbox-user',
  //   },
  // ]

  // Use real quests if available, otherwise fallback to dummy quests
  // const allQuests: Quest[] = quests?.length ? quests : dummyQuests
  const allQuests: Quest[] = quests ?? []

  // Filter quests by region & valid date
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const validQuests = useMemo(() => {
    return allQuests.filter((quest) => {
      const questEndDate = quest.quest_end?.split('T')[0] ?? ''
      const matchesRegion =
        selectedRegion === 'Browse all' || quest.region === selectedRegion
      return matchesRegion && questEndDate >= today
    })
  }, [allQuests, selectedRegion, today])

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
        <CardContent>
          <AddQuestButton to={'/user/quest/create'} />

          {isLoading && <p>Loading quests...</p>}
          {error && <p>Failed to fetch quests.</p>}
          {!isLoading && !error && validQuests.length === 0 && (
            <p>No quests were found for this region.</p>
          )}
          {!isLoading &&
            !error &&
            validQuests.length > 0 &&
            validQuests.map((quest: Quest) => (
              <QuestListItem
                key={quest.id}
                quest={{
                  ...quest,
                  quest_name: quest.quest_name ?? 'Untitled Quest',
                  quest_image: quest.quest_image ?? undefined,
                  quest_start: quest.quest_start ?? undefined,
                  quest_end: quest.quest_end ?? undefined,
                  region: quest.region ?? 'Unknown',
                }}
              />
            ))}
        </CardContent>
      </Card>
    </div>
  )
}
