import { useLocation } from 'react-router-dom'
import QuestListItem from '@/components/QuestListItem'
import { useQuestList } from '@/hooks/userQuests'
import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import bg from '@/assets/images/background_main.png'
import type { Quest } from '@/types'
import AddQuestButton from '@/components/AddQuestButton'
import HomeButton from '@/components/HomeButton'

export default function QuestPage() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const selectedRegion = searchParams.get('region') || 'Browse all'

  const { data: quests, error, isLoading } = useQuestList()
  const allQuests: Quest[] = quests ?? []

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
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl max-w-3xl w-full flex flex-col">
        <CardContent className="flex flex-col gap-4">
          {/* Top: Page title + add quest button */}
          <div className="w-full flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold">Quests</h1>
            <AddQuestButton to="/user/quest/create" />
          </div>

          {/* Loading / error / empty states */}
          {isLoading && <p>Loading quests...</p>}
          {error && <p>Failed to fetch quests.</p>}
          {!isLoading && !error && validQuests.length === 0 && (
            <p>No quests were found for this region.</p>
          )}

          {/* Quest list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          </div>

          {/* Bottom: Home button centered */}
          <div className="flex justify-center mt-4">
            <HomeButton />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
