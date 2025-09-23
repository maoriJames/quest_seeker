import { useLocation } from 'react-router-dom'
import QuestListItem from '@/components/QuestListItem'
import { useQuestList } from '@/hooks/userQuests'
import { useMemo } from 'react'
import bg from '@/assets/images/background_main.png'

export default function HomePage() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const selectedRegion = searchParams.get('region') || 'Browse all'

  // Fetch all quests
  const { data: quests, error, isLoading } = useQuestList()

  // Filter quests by region & valid date
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const validQuests = useMemo(() => {
    if (!quests) return []

    return quests.filter((quest) => {
      const questEndDate = quest.quest_end?.split('T')[0] || ''
      const matchesRegion =
        selectedRegion === 'Browse all' || quest.region === selectedRegion
      return matchesRegion && questEndDate >= today
    })
  }, [quests, selectedRegion, today])

  if (isLoading) return <p>Loading quests...</p>
  if (error) return <p>Failed to fetch quests.</p>
  if (validQuests.length === 0)
    return <p>No quests were found for this region.</p>

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {validQuests.map((quest) => (
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
    </div>
  )
}
